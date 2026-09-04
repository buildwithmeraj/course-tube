import { getCoursesDB } from "@/lib/getDB";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// A video counts as finished once this much of it has been watched. The old
// model only completed on the player's ENDED event, so skipping an outro left
// the video permanently unfinished.
const COMPLETION_RATIO = 0.9;

export async function GET(req, { params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const db = await getCoursesDB();
  const courseId = new ObjectId(id);

  const records = await db
    .collection("videoProgress")
    .find({ courseId, userEmail: session.user.email })
    .toArray();

  const videos = {};
  let completedCount = 0;
  let lastVideoId = null;
  let lastUpdatedAt = null;

  for (const record of records) {
    const key = record.videoId.toString();
    videos[key] = {
      completedAt: record.completedAt ?? null,
      positionSeconds: record.positionSeconds ?? 0,
    };

    if (record.completedAt) completedCount++;

    if (!lastUpdatedAt || (record.updatedAt && record.updatedAt > lastUpdatedAt)) {
      lastUpdatedAt = record.updatedAt;
      lastVideoId = key;
    }
  }

  return NextResponse.json({
    videos,
    completedCount,
    lastVideoId,
    // Lets the client show which videos arrived since the last visit
    lastActiveAt: lastUpdatedAt,
  });
}

export async function PATCH(req, { params }) {
  const { id } = await params;
  const requestedVideoId = req.nextUrl.searchParams.get("videoId");
  const session = await getServerSession(authOptions);

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ message: "Invalid course ID" }, { status: 400 });
  }

  if (!ObjectId.isValid(requestedVideoId)) {
    return NextResponse.json({ message: "Invalid video ID" }, { status: 400 });
  }

  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const positionSeconds = Number(body?.positionSeconds);
  const explicitlyCompleted = body?.completed === true;

  if (
    body?.positionSeconds !== undefined &&
    (!Number.isFinite(positionSeconds) || positionSeconds < 0)
  ) {
    return NextResponse.json(
      { message: "positionSeconds must be a non-negative number" },
      { status: 400 },
    );
  }

  const db = await getCoursesDB();
  const courseId = new ObjectId(id);
  const videoId = new ObjectId(requestedVideoId);
  const userEmail = session.user.email;

  const video = await db
    .collection("videos")
    .findOne({ _id: videoId, courseId });

  if (!video) {
    return NextResponse.json(
      { message: "Video not found in this course" },
      { status: 404 },
    );
  }

  const progressCol = db.collection("videoProgress");
  const existing = await progressCol.findOne({ courseId, videoId, userEmail });

  // Completion is decided server-side from the stored duration, so a client
  // cannot mark a video finished by asserting it.
  const duration = Number(video.durationSeconds) || 0;
  const reachedThreshold =
    duration > 0 && positionSeconds >= duration * COMPLETION_RATIO;

  const set = {
    userEmail,
    courseId,
    videoId,
    updatedAt: new Date(),
  };

  if (Number.isFinite(positionSeconds)) {
    set.positionSeconds = positionSeconds;
  }

  // Once complete, a video stays complete — rewatching must not undo it
  if (!existing?.completedAt && (explicitlyCompleted || reachedThreshold)) {
    set.completedAt = new Date();
  }

  // `completedAt` must not appear in both operators or the update conflicts
  const update = { $set: set };
  if (!("completedAt" in set)) {
    update.$setOnInsert = { completedAt: null };
  }

  await progressCol.updateOne({ courseId, videoId, userEmail }, update, {
    upsert: true,
  });

  return NextResponse.json({
    message: "Progress saved",
    completed: Boolean(existing?.completedAt || set.completedAt),
  });
}
