import { authOptions } from "@/lib/auth";
import { getCoursesDB } from "@/lib/getDB";
import { canViewCourse } from "@/lib/courseAccess";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// One video, including the description the listing endpoint leaves out.
export async function GET(req, { params }) {
  try {
    const { id, videoId } = await params;

    if (!ObjectId.isValid(id) || !ObjectId.isValid(videoId)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const db = await getCoursesDB();
    const courseId = new ObjectId(id);

    const course = await db.collection("courses").findOne({ _id: courseId });

    if (!course) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 },
      );
    }

    const session = await getServerSession(authOptions);
    if (!(await canViewCourse(course, session, db))) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 },
      );
    }

    const video = await db
      .collection("videos")
      .findOne({ _id: new ObjectId(videoId), courseId });

    if (!video) {
      return NextResponse.json({ message: "Video not found" }, { status: 404 });
    }

    return NextResponse.json(video, { status: 200 });
  } catch (err) {
    console.error("Error fetching video:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
