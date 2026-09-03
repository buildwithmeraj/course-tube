import { authOptions } from "@/lib/auth";
import { getCoursesDB } from "@/lib/getDB";
import { canViewCourse } from "@/lib/courseAccess";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const db = await getCoursesDB();

    const course = await db
      .collection("courses")
      .findOne({ _id: new ObjectId(id) });

    if (!course) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 },
      );
    }

    // A pending course's videos are as private as the course itself
    const session = await getServerSession(authOptions);
    if (!(await canViewCourse(course, session, db))) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 },
      );
    }

    const videos = await db
      .collection("videos")
      .find({ courseId: new ObjectId(id) })
      .sort({ order: 1, _id: 1 })
      .toArray();

    return NextResponse.json(videos, { status: 200 });
  } catch (err) {
    console.error("Error fetching videos:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
