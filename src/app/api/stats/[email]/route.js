import { getCoursesDB } from "@/lib/getDB";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req, { params }) {
  const { email } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (email !== session?.user?.email) {
    return NextResponse.json(
      { message: "You can not view someone else's progress" },
      { status: 401 },
    );
  }

  const db = await getCoursesDB();
  const enrollsCol = db.collection("enrolls");
  const progressCol = db.collection("progress");
  const videosCol = db.collection("videos");

  const enrolls = await enrollsCol
    .find({ userEmail: session?.user?.email })
    .toArray();

  const courseIds = enrolls
    .map((enroll) => enroll.courseId)
    .filter((courseId) => ObjectId.isValid(courseId));

  if (courseIds.length === 0) {
    return NextResponse.json({
      enrolledCount: 0,
      completedCount: 0,
      inProgressCount: 0,
      courses: [],
    });
  }

  const progressDocs = await progressCol
    .find({ userEmail: session?.user?.email, courseId: { $in: courseIds } })
    .toArray();

  const progressByCourseId = new Map(
    progressDocs.map((doc) => [doc.courseId.toString(), doc]),
  );

  const lastVideos = await videosCol
    .aggregate([
      { $match: { courseId: { $in: courseIds } } },
      { $sort: { courseId: 1, order: -1, position: -1, _id: -1 } },
      { $group: { _id: "$courseId", lastVideoId: { $first: "$_id" } } },
    ])
    .toArray();

  const lastVideoByCourseId = new Map(
    lastVideos.map((doc) => [doc._id.toString(), doc.lastVideoId]),
  );

  const courses = enrolls.map((enroll) => {
    const courseId = enroll.courseId?.toString();
    const progress = courseId ? progressByCourseId.get(courseId) : null;
    const lastVideoId = courseId ? lastVideoByCourseId.get(courseId) : null;
    const finishedVideoId = progress?.finishedVideo || null;
    const completed =
      !!finishedVideoId &&
      !!lastVideoId &&
      finishedVideoId.toString() === lastVideoId.toString();

    return {
      courseId: enroll.courseId,
      progress,
      lastVideoId,
      completed,
    };
  });

  const enrolledCount = courses.length;
  const completedCount = courses.filter((course) => course.completed).length;
  const inProgressCount = Math.max(enrolledCount - completedCount, 0);

  return NextResponse.json({
    enrolledCount,
    completedCount,
    inProgressCount,
    courses,
  });
}
