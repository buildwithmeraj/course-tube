import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;

export async function GET(req) {
  try {
    const params = req.nextUrl.searchParams;
    const approved = params.get("approved");
    const popular = params.get("popular");
    const limitParam = params.get("limit");

    console.log("Query params:", { approved, popular, limitParam });

    // Parse limit
    let limit = DEFAULT_LIMIT;
    if (limitParam !== null && limitParam !== "") {
      const parsedLimit = parseInt(limitParam, 10);
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        return NextResponse.json(
          { message: "Limit must be a positive integer" },
          { status: 400 }
        );
      }
      if (parsedLimit > MAX_LIMIT) {
        return NextResponse.json(
          { message: `Limit cannot exceed ${MAX_LIMIT}` },
          { status: 400 }
        );
      }
      limit = parsedLimit;
    }

    // Build filter
    let filter = {};
    if (approved === "true") {
      filter.approved = true;
    } else if (approved === "false") {
      filter.approved = false;
    }

    console.log("Filter:", filter, "Limit:", limit);

    const client = await clientPromise;
    const db = client.db("courses");
    let courses = [];

    if (popular === "true") {
      console.log("Fetching popular courses with aggregation");
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
      console.log("Fetching regular courses");
      courses = await db
        .collection("courses")
        .find(filter)
        .limit(limit)
        .toArray();
    }

    console.log(`Found ${courses.length} courses`);
    return NextResponse.json(courses, { status: 200 });
  } catch (err) {
    console.error("Error fetching courses:", err);
    return NextResponse.json(
      { message: "Internal server error", error: err.message },
      { status: 500 }
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
    const { playlistId, title, totalCount, videos } = body;

    console.log("POST request body:", {
      playlistId,
      title,
      totalCount,
      videoCount: videos?.length,
    });

    // Validation
    if (!playlistId?.trim()) {
      return NextResponse.json(
        { message: "playlistId is required" },
        { status: 400 }
      );
    }

    if (!title?.trim()) {
      return NextResponse.json(
        { message: "title is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(videos)) {
      return NextResponse.json(
        { message: "videos must be an array" },
        { status: 400 }
      );
    }

    if (videos.length === 0) {
      return NextResponse.json(
        { message: "Course must have at least one video" },
        { status: 400 }
      );
    }

    if (videos.length > 200) {
      return NextResponse.json(
        { message: "Course exceeds maximum video limit of 200" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("courses");
    const coursesCol = db.collection("courses");
    const videosCol = db.collection("videos");

    // Check for existing course
    const existing = await coursesCol.findOne({ playlistId });
    if (existing) {
      return NextResponse.json(
        { message: "Course already exists", courseId: existing._id },
        { status: 409 }
      );
    }

    // Get thumbnail from first video if available
    const thumbnailUrl = videos[0]?.thumbnail || "";

    // Insert course
    const courseRes = await coursesCol.insertOne({
      playlistId,
      title,
      totalCount: totalCount || videos.length,
      thumbnailUrl,
      approved: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const courseId = courseRes.insertedId;
    console.log("Course created with ID:", courseId);

    // Enroll user to this course
    await db.collection("enrolls").insertOne({
      courseId,
      userEmail: session.user.email,
      createdAt: new Date(),
    });

    // Insert videos
    await videosCol.insertMany(
      videos.map((v, index) => ({
        ...v,
        courseId,
        order: index,
        createdAt: new Date(),
      })),
      { ordered: false }
    );

    console.log(`Inserted ${videos.length} videos for course ${courseId}`);

    return NextResponse.json(
      { message: "Course and videos stored successfully", courseId },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error creating course:", err);
    return NextResponse.json(
      { message: "Internal server error", error: err.message },
      { status: 500 }
    );
  }
}
