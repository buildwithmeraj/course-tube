import { NextResponse } from "next/server";
import { getCoursesDB } from "@/lib/getDB";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkCourseAddLimits } from "@/lib/courseLimits";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { RATE_LIMITS } from "@/lib/limits";
import {
  YouTubeError,
  fetchPlaylistInfo,
  fetchPlaylistVideos,
  parsePlaylistId,
} from "@/lib/youtubeApi";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DEFAULT_LIMIT = 1000;
const MAX_LIMIT = 1000;
const MAX_QUERY_LENGTH = 100;

// Neutralise regex metacharacters so a search term cannot become a pattern
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function GET(req) {
  try {
    const params = req.nextUrl.searchParams;
    const approved = params.get("approved");
    const popular = params.get("popular");
    const limitParam = params.get("limit");
    const query = params.get("q");
    const sortBy = params.get("sortBy");

    // Parse limit
    let limit = DEFAULT_LIMIT;
    if (limitParam !== null && limitParam !== "") {
      const parsedLimit = parseInt(limitParam, 10);
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        return NextResponse.json(
          { message: "Limit must be a positive integer" },
          { status: 400 },
        );
      }
      if (parsedLimit > MAX_LIMIT) {
        return NextResponse.json(
          { message: `Limit cannot exceed ${MAX_LIMIT}` },
          { status: 400 },
        );
      }
      limit = parsedLimit;
    }

    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "admin";

    // Build filter
    let filter = {};
    if (isAdmin) {
      // Only admins may narrow by approval state, or list every course
      if (approved === "true") {
        filter.approved = true;
      } else if (approved === "false") {
        filter.approved = false;
      }
    } else {
      // Pending courses stay private to their uploader, who reaches them
      // through their enrolments rather than this listing
      filter.approved = true;
    }

    if (query && query.length > 0) {
      const { allowed, retryAfterSeconds } = await checkRateLimit({
        key: `search:${getClientIp(req)}`,
        ...RATE_LIMITS.search,
      });

      if (!allowed) {
        return NextResponse.json(
          { message: "Too many searches. Please slow down." },
          {
            status: 429,
            headers: { "Retry-After": String(retryAfterSeconds) },
          },
        );
      }

      filter.title = {
        $regex: escapeRegex(query.slice(0, MAX_QUERY_LENGTH)),
        $options: "i",
      };
    }

    const db = await getCoursesDB();
    let courses = [];

    if (popular === "true") {
      courses = await db
        .collection("courses")
        .aggregate([
          { $match: filter },
          {
            $lookup: {
              from: "enrolls",
              localField: "_id",
              foreignField: "courseId",
              as: "enrolls",
            },
          },
          {
            $addFields: {
              enrollCount: { $size: "$enrolls" },
            },
          },
          {
            $project: {
              "enrolls.userEmail": 0,
            },
          },
          { $sort: { enrollCount: -1 } },
          { $limit: limit },
        ])
        .toArray();
    } else {
      courses = await db
        .collection("courses")
        .aggregate([
          { $match: filter },
          {
            $lookup: {
              from: "enrolls",
              localField: "_id",
              foreignField: "courseId",
              as: "enrolls",
            },
          },
          {
            $addFields: {
              enrollCount: { $size: "$enrolls" },
            },
          },
          {
            $project: {
              "enrolls.userEmail": 0,
            },
          },
          ...(sortBy === "enrollCount"
            ? [{ $sort: { enrollCount: -1 } }]
            : sortBy === "totalCount"
              ? [{ $sort: { totalCount: -1 } }]
              : sortBy === "createdAt"
                ? [{ $sort: { createdAt: -1 } }]
                : sortBy === "updatedAt"
                  ? [{ $sort: { updatedAt: -1 } }]
                  : []),
          { $limit: limit },
        ])
        .toArray();
    }
    const res = NextResponse.json(courses, { status: 200 });
    res.headers.set("Cache-Control", "no-store, max-age=0");
    return res;
  } catch (err) {
    console.error("Error fetching courses:", err);
    return NextResponse.json(
      { message: "Internal server error", error: err.message },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // The client sends only a playlist reference; everything else is fetched
    // here so the YouTube key stays on the server and the stored documents
    // cannot be shaped by the caller.
    const playlistId = parsePlaylistId(body?.url ?? body?.playlistId);

    if (!playlistId) {
      return NextResponse.json(
        { message: "A valid YouTube playlist URL is required" },
        { status: 400 },
      );
    }

    const db = await getCoursesDB();
    const coursesCol = db.collection("courses");
    const videosCol = db.collection("videos");

    // Check for existing course
    const existing = await coursesCol.findOne({ playlistId });
    if (existing) {
      return NextResponse.json(
        { message: "Course already exists", courseId: existing._id },
        { status: 409 },
      );
    }

    const limited = await checkCourseAddLimits(db, session);
    if (limited) {
      return NextResponse.json(
        { message: limited.message },
        { status: limited.status },
      );
    }

    const { title, totalCount } = await fetchPlaylistInfo(playlistId);
    const videos = await fetchPlaylistVideos(playlistId);

    // Insert course
    const courseRes = await coursesCol.insertOne({
      playlistId,
      ownerEmail: session.user.email,
      title,
      totalCount: totalCount || videos.length,
      thumbnailUrl: videos[0]?.thumbnail || "",
      approved: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const courseId = courseRes.insertedId;

    // Enroll user to this course
    await db.collection("enrolls").insertOne({
      courseId,
      userEmail: session.user.email,
      enrolledAt: new Date(),
    });

    // Insert videos
    await videosCol.insertMany(
      videos.map((v, index) => ({
        ...v,
        courseId,
        order: index,
      })),
      { ordered: false },
    );

    return NextResponse.json(
      { message: "Course and videos stored successfully", courseId },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof YouTubeError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }

    console.error("Error creating course:", err);
    return NextResponse.json(
      { message: "Internal server error", error: err.message },
      { status: 500 },
    );
  }
}
