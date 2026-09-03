import { getCoursesDB } from "@/lib/getDB";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { canViewCourse } from "@/lib/courseAccess";

export async function PATCH(req, { params }) {
  const { id } = await params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { approved } = await req.json();
  if (typeof approved !== "boolean") {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  const db = await getCoursesDB();
  const coursesCol = db.collection("courses");

  const courseId = new ObjectId(id);

  const res = await coursesCol.updateOne(
    { _id: courseId },
    { $set: { approved } }
  );

  if (res.matchedCount === 0) {
    return NextResponse.json({ message: "Course not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Course updated" });
}

export async function DELETE(req, { params }) {
  const { id } = await params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const db = await getCoursesDB();
  const coursesCol = db.collection("courses");

  const courseId = new ObjectId(id);

  const res = await coursesCol.deleteOne({ _id: courseId });

  if (res.deletedCount === 0) {
    return NextResponse.json({ message: "Course not found" }, { status: 404 });
  }

  const videosCol = db.collection("videos");
  await videosCol.deleteMany({ courseId });

  const enrollsCol = db.collection("enrolls");
  await enrollsCol.deleteMany({ courseId });

  return NextResponse.json({ message: "Course deleted" });
}

export async function GET(req, { params }) {
  const { id } = await params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  const db = await getCoursesDB();
  const coursesCol = db.collection("courses");

  const course = await coursesCol.findOne({
    _id: new ObjectId(id),
  });

  if (!course) {
    return NextResponse.json({ message: "Course not found" }, { status: 404 });
  }

  // Do not disclose that a pending course exists to people who cannot see it
  const session = await getServerSession(authOptions);
  if (!(await canViewCourse(course, session, db))) {
    return NextResponse.json({ message: "Course not found" }, { status: 404 });
  }

  return NextResponse.json(course);
}
