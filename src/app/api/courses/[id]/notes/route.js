import { getCoursesDB } from "@/lib/getDB";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MAX_NOTES_PER_COURSE, MAX_NOTE_LENGTH } from "@/lib/limits";

// Notes are private to the person who wrote them.
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

  const notes = await db
    .collection("notes")
    .find({ courseId: new ObjectId(id), userEmail: session.user.email })
    .sort({ videoId: 1, seconds: 1 })
    .toArray();

  return NextResponse.json(notes);
}

export async function POST(req, { params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  const seconds = Number(body?.seconds);

  if (!text) {
    return NextResponse.json({ message: "Note cannot be empty" }, { status: 400 });
  }

  if (text.length > MAX_NOTE_LENGTH) {
    return NextResponse.json(
      { message: `Notes are limited to ${MAX_NOTE_LENGTH} characters` },
      { status: 400 },
    );
  }

  if (!ObjectId.isValid(body?.videoId)) {
    return NextResponse.json({ message: "Invalid video ID" }, { status: 400 });
  }

  if (!Number.isFinite(seconds) || seconds < 0) {
    return NextResponse.json(
      { message: "seconds must be a non-negative number" },
      { status: 400 },
    );
  }

  const db = await getCoursesDB();
  const courseId = new ObjectId(id);
  const videoId = new ObjectId(body.videoId);
  const userEmail = session.user.email;

  // The video must belong to this course
  const video = await db.collection("videos").findOne({ _id: videoId, courseId });
  if (!video) {
    return NextResponse.json(
      { message: "Video not found in this course" },
      { status: 404 },
    );
  }

  const notesCol = db.collection("notes");

  const existing = await notesCol.countDocuments({ courseId, userEmail });
  if (existing >= MAX_NOTES_PER_COURSE) {
    return NextResponse.json(
      { message: `You can keep ${MAX_NOTES_PER_COURSE} notes per course.` },
      { status: 429 },
    );
  }

  const now = new Date();
  const result = await notesCol.insertOne({
    userEmail,
    courseId,
    videoId,
    seconds: Math.floor(seconds),
    text,
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json(
    { _id: result.insertedId, videoId, seconds: Math.floor(seconds), text, createdAt: now },
    { status: 201 },
  );
}
