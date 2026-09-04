import { NextResponse } from "next/server";
import { getCoursesDB } from "@/lib/getDB";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";
import { MAX_SYNCS_PER_DAY } from "@/lib/limits";
import {
  YouTubeError,
  fetchPlaylistInfo,
  fetchPlaylistVideos,
} from "@/lib/youtubeApi";

// A course may only be re-synced once per week
const SYNC_INTERVAL_DAYS = 7;
const SYNC_INTERVAL_MS = SYNC_INTERVAL_DAYS * 24 * 60 * 60 * 1000;

export async function PATCH(req, { params }) {
  const { id } = await params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const courseId = new ObjectId(id);
  const db = await getCoursesDB();
  const coursesCol = db.collection("courses");
  const videosCol = db.collection("videos");

  const course = await coursesCol.findOne({ _id: courseId });

  if (!course) {
    return NextResponse.json({ message: "Course not found" }, { status: 404 });
  }

  // Only an admin or a learner enrolled in this course may spend YouTube quota
  if (session.user.role !== "admin") {
    const enrollment = await db.collection("enrolls").findOne({
      courseId,
      userEmail: session.user.email,
    });

    if (!enrollment) {
      return NextResponse.json(
        { message: "You must be enrolled in this course to synchronize it" },
        { status: 403 },
      );
    }
  }

  // Cap how much quota one person can spend a day, independent of the
  // per-course interval below
  if (session.user.role !== "admin") {
    const { allowed } = await checkRateLimit({
      key: `sync:${session.user.email}`,
      limit: MAX_SYNCS_PER_DAY,
      windowMs: 24 * 60 * 60 * 1000,
    });

    if (!allowed) {
      return NextResponse.json(
        {
          message: `You can synchronize ${MAX_SYNCS_PER_DAY} courses per day. Try again tomorrow.`,
        },
        { status: 429 },
      );
    }
  }

  // Claim the sync slot atomically so concurrent requests cannot both pass
  const cutoff = new Date(Date.now() - SYNC_INTERVAL_MS);
  const claimed = await coursesCol.findOneAndUpdate(
    {
      _id: courseId,
      $or: [
        { updatedAt: { $lt: cutoff } },
        { updatedAt: null },
        { updatedAt: { $exists: false }, createdAt: { $lt: cutoff } },
        { updatedAt: { $exists: false }, createdAt: { $exists: false } },
      ],
    },
    { $set: { updatedAt: new Date() } },
  );

  if (!claimed) {
    const lastUpdate = course.updatedAt || course.createdAt;
    const daysSinceUpdate = Math.ceil(
      (Date.now() - new Date(lastUpdate).getTime()) / (1000 * 60 * 60 * 24),
    );

    return NextResponse.json(
      {
        message: `Course was last updated ${daysSinceUpdate} day(s) ago. Please wait ${
          SYNC_INTERVAL_DAYS - daysSinceUpdate
        } more day(s) before updating again.`,
      },
      { status: 429 },
    );
  }

  try {
    const { title, totalCount } = await fetchPlaylistInfo(course.playlistId);
    const videos = await fetchPlaylistVideos(course.playlistId);

    await coursesCol.updateOne(
      { _id: courseId },
      {
        $set: {
          title,
          totalCount,
          totalDurationSeconds: videos.reduce(
            (sum, video) => sum + (Number(video.durationSeconds) || 0),
            0,
          ),
          thumbnailUrl: videos[0]?.thumbnail || course.thumbnailUrl || "",
          updatedAt: new Date(),
        },
      },
    );

    // Upsert on (courseId, videoId) rather than replacing the set outright:
    // saved progress points at these documents by _id, so reinserting them
    // would silently reset every enrolled learner to the first video.
    const existingIds = new Set(
      (
        await videosCol
          .find({ courseId }, { projection: { videoId: 1 } })
          .toArray()
      ).map((v) => v.videoId),
    );
    const addedCount = videos.filter((v) => !existingIds.has(v.videoId)).length;

    await videosCol.bulkWrite(
      videos.map((v, index) => ({
        updateOne: {
          filter: { courseId, videoId: v.videoId },
          update: {
            $set: { ...v, courseId, order: index },
            // Only set on insert, so "new since you last watched" stays true
            $setOnInsert: { addedAt: new Date() },
          },
          upsert: true,
        },
      })),
      { ordered: false },
    );

    // Drop videos that are no longer part of the playlist
    const { deletedCount: removedCount } = await videosCol.deleteMany({
      courseId,
      videoId: { $nin: videos.map((v) => v.videoId) },
    });

    return NextResponse.json(
      {
        message: "Course and videos updated successfully",
        courseId: id,
        title,
        totalCount,
        videosUpdated: videos.length,
        added: addedCount,
        removed: removedCount,
      },
      { status: 200 },
    );
  } catch (err) {
    // Release the slot so a failed sync does not lock the course for a week
    await coursesCol.updateOne(
      { _id: courseId },
      { $set: { updatedAt: claimed.updatedAt ?? null } },
    );

    if (err instanceof YouTubeError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }

    console.error("Error synchronizing course:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
