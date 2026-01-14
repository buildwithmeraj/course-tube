import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req) {
  try {
    const params = req.nextUrl.searchParams;
    const approved = params.get("approved");
    let filter = {};

    if (approved === "true") {
      filter.approved = true;
    } else if (approved === "false") {
      filter.approved = false;
    }
    const client = await clientPromise;
    const db = client.db("courses");

    const courses = await db.collection("courses").find(filter).toArray();

    return NextResponse.json(courses, { status: 200 });
  } catch (err) {
    console.error("Error fetching courses:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  try {
    const { playlistId, title, totalCount, videos } = await req.json();
    let thumbnailUrl = "";

    if (!playlistId || !title || !Array.isArray(videos)) {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("courses");

    const coursesCol = db.collection("courses");
    const videosCol = db.collection("videos");

    // Check for existing course
    const existing = await coursesCol.findOne({ playlistId });
    if (existing) {
      return NextResponse.json(
        { message: "Course already exists" },
        { status: 400 }
      );
    }

    // Get thumbnail from first video if available
    if (videos.length > 0 && videos[0].thumbnail) {
      thumbnailUrl = videos[0].thumbnail;
    }

    // Insert course
    const courseRes = await coursesCol.insertOne({
      playlistId,
      title,
      totalCount,
      thumbnailUrl,
      approved: false,
      createdAt: new Date(),
    });

    const courseId = courseRes.insertedId;

    // enroll users to this course (optional)
    const enrollUser = await db.collection("enrolls").insertOne({
      courseId,
      userEmail: session.user.email,
      createdAt: new Date(),
    });

    // Insert videos
    if (videos.length) {
      await videosCol.insertMany(
        videos.map((v) => ({
          ...v,
          courseId,
          createdAt: new Date(),
        })),
        { ordered: false }
      );
    }

    return NextResponse.json(
      { message: "Course and videos stored", courseId },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
