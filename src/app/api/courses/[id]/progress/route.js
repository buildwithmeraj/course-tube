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

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const client = await clientPromise;
  const db = client.db("courses");
  const progressCol = db.collection("progress");

  const course = await progressCol.findOne({
    courseId: new ObjectId(id),
    userEmail: session?.user?.email,
  });

  return NextResponse.json(course);
}

export async function PATCH(req, { params }) {
  const { id } = await params;
  const finishedVideoId = req.nextUrl.searchParams.get("videoId");

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ message: "Invalid course ID" }, { status: 400 });
  }

  if (!ObjectId.isValid(finishedVideoId)) {
    return NextResponse.json({ message: "Invalid video ID" }, { status: 400 });
  }

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const client = await clientPromise;
  const db = client.db("courses");
  const progressCol = db.collection("progress");

  const courseId = new ObjectId(id);
  const videoId = new ObjectId(finishedVideoId);
  const session = await getServerSession(authOptions);

  // Fetch existing progress
  const courseProgress = await progressCol.findOne({
    courseId,
    userEmail: session?.user?.email,
  });

  if (courseProgress) {
    // Only update if the new video is "newer" than the previous one
    if (
      !courseProgress.finishedVideo ||
      new ObjectId(courseProgress.finishedVideo) < videoId
    ) {
      await progressCol.updateOne(
        { courseId, userEmail: session?.user?.email },
        { $set: { finishedVideo: videoId } }
      );
      return NextResponse.json({ message: "Progress updated" });
    } else {
      // The new video is older or equal, no update needed
      return NextResponse.json({ message: "Video already watched or older" });
    }
  } else {
    // Create new progress
    await progressCol.insertOne({
      courseId,
      userEmail: session?.user?.email,
      finishedVideo: videoId,
    });
    return NextResponse.json({ message: "Progress created" });
  }
}
