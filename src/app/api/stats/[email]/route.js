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
  const progressCol = db.collection("videoProgress");
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

  // Completion is now "every video in the course has a completedAt", rather
  // than "the pointer happens to sit on the last video".
  const completedPerCourse = await progressCol
    .aggregate([
      {
        $match: {
          userEmail: session.user.email,
          courseId: { $in: courseIds },
          completedAt: { $ne: null },
        },
      },
      { $group: { _id: "$courseId", completed: { $sum: 1 } } },
    ])
    .toArray();

  const completedByCourseId = new Map(
    completedPerCourse.map((doc) => [doc._id.toString(), doc.completed]),
  );

  // Deleted or private videos can never be watched, so they are excluded from
  // the total a learner has to finish
  const totalPerCourse = await videosCol
    .aggregate([
      { $match: { courseId: { $in: courseIds }, unavailable: { $ne: true } } },
      { $group: { _id: "$courseId", total: { $sum: 1 } } },
    ])
    .toArray();

  const totalByCourseId = new Map(
    totalPerCourse.map((doc) => [doc._id.toString(), doc.total]),
  );

  const courses = enrolls.map((enroll) => {
    const courseId = enroll.courseId?.toString();
    const completedVideos = completedByCourseId.get(courseId) || 0;
    const totalVideos = totalByCourseId.get(courseId) || 0;

    return {
      courseId: enroll.courseId,
      completedVideos,
      totalVideos,
      completed: totalVideos > 0 && completedVideos >= totalVideos,
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
