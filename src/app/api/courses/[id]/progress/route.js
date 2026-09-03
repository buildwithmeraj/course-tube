import { getCoursesDB } from "@/lib/getDB";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Where a video sits in the playlist; `order` is the stored fallback
const positionOf = (video) => video?.position ?? video?.order ?? 0;

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
  const progressCol = db.collection("progress");

  const progress = await progressCol.findOne({
    courseId: new ObjectId(id),
    userEmail: session.user.email,
  });

  return NextResponse.json(progress);
}

export async function PATCH(req, { params }) {
  const { id } = await params;
  const finishedVideoId = req.nextUrl.searchParams.get("videoId");
  const session = await getServerSession(authOptions);

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ message: "Invalid course ID" }, { status: 400 });
  }

  if (!ObjectId.isValid(finishedVideoId)) {
    return NextResponse.json({ message: "Invalid video ID" }, { status: 400 });
  }

  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const db = await getCoursesDB();
  const progressCol = db.collection("progress");
  const videosCol = db.collection("videos");

  const courseId = new ObjectId(id);
  const videoId = new ObjectId(finishedVideoId);
  const userEmail = session.user.email;

  const video = await videosCol.findOne({ _id: videoId, courseId });

  if (!video) {
    return NextResponse.json(
      { message: "Video not found in this course" },
      { status: 404 },
    );
  }

  const courseProgress = await progressCol.findOne({ courseId, userEmail });

  if (courseProgress?.finishedVideo) {
    const finished = await videosCol.findOne({
      _id: courseProgress.finishedVideo,
      courseId,
    });

    // Progress only moves forward. Compare playlist position, not _id — ids
    // are not minted in playlist order once a course has been synchronized.
    if (finished && positionOf(finished) >= positionOf(video)) {
      return NextResponse.json({ message: "Video already watched or older" });
    }
  }

  await progressCol.updateOne(
    { courseId, userEmail },
    { $set: { finishedVideo: videoId, updatedAt: new Date() } },
    { upsert: true },
  );

  return NextResponse.json({ message: "Progress updated" });
}
