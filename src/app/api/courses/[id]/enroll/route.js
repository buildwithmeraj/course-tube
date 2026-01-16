import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req, { params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("courses");
  const enrollsCol = db.collection("enrolls");

  const course = await enrollsCol.findOne({
    courseId: new ObjectId(id),
    userEmail: session?.user?.email,
  });

  return NextResponse.json(course);
}

export async function POST(req, { params }) {
  const { id } = await params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ message: "Invalid course ID" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("courses");
  const enrollsCol = db.collection("enrolls");

  const courseId = new ObjectId(id);
  const session = await getServerSession(authOptions);

  // Fetch existing progress
  const courseProgress = await enrollsCol.findOne({
    courseId,
    userEmail: session?.user?.email,
  });

  if (!courseProgress) {
    // enroll the user if not enrolled
    await enrollsCol.insertOne({
      courseId,
      userEmail: session?.user?.email,
      enrolledAt: new Date(),
    });
    return NextResponse.json({ message: "Enrolled successfully" });
  } else {
    return NextResponse.json({ message: "Already enrolled" });
  }
}
