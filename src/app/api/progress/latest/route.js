import { getCoursesDB } from "@/lib/getDB";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// The single video this user should resume: the most recently watched one that
// is not finished, or the next video in that course if it is.
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const db = await getCoursesDB();
  const userEmail = session.user.email;

  const [latest] = await db
    .collection("videoProgress")
    .find({ userEmail })
    .sort({ updatedAt: -1 })
    .limit(1)
    .toArray();

  if (!latest) {
    return NextResponse.json({ resume: null });
  }

  const [course, video] = await Promise.all([
    db.collection("courses").findOne({ _id: latest.courseId }),
    db.collection("videos").findOne({ _id: latest.videoId }),
  ]);

  // The course or video may have been removed since it was last watched
  if (!course || !video) {
    return NextResponse.json({ resume: null });
  }

  let target = video;
  let positionSeconds = latest.positionSeconds || 0;

  // Finished it last time? Point at the next video instead of replaying it.
  if (latest.completedAt) {
    const next = await db
      .collection("videos")
      .find({ courseId: latest.courseId, order: { $gt: video.order ?? 0 } })
      .sort({ order: 1 })
      .limit(1)
      .next();

    if (next) {
      target = next;
      positionSeconds = 0;
    }
  }

  const completedCount = await db
    .collection("videoProgress")
    .countDocuments({ userEmail, courseId: latest.courseId, completedAt: { $ne: null } });

  return NextResponse.json({
    resume: {
      courseId: course._id.toString(),
      courseTitle: course.title,
      thumbnailUrl: target.thumbnail || course.thumbnailUrl || "",
      videoId: target._id.toString(),
      videoTitle: target.title,
      position: target.position ?? target.order ?? 0,
      positionSeconds,
      totalCount: course.totalCount ?? 0,
      completedCount,
      lastWatchedAt: latest.updatedAt ?? null,
    },
  });
}
