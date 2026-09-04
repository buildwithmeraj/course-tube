// Server-side loader for the watch page. The same data the client used to
// fetch from /api/courses/[id] and /api/courses/[id]/videos after hydration,
// read once during render instead.
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { getCoursesDB } from "./getDB";
import { canViewCourse } from "./courseAccess";
import { authOptions } from "./auth";
import { toPlain } from "./queries";

export async function loadWatchPage(id) {
  if (!ObjectId.isValid(id)) return null;

  const db = await getCoursesDB();
  const courseId = new ObjectId(id);

  const course = await db.collection("courses").findOne({ _id: courseId });
  if (!course) return null;

  // A pending course's videos are as private as the course itself
  const session = await getServerSession(authOptions);
  if (!(await canViewCourse(course, session, db))) return null;

  // Descriptions are fetched per video on selection; including them here costs
  // ~500 KB on the largest courses.
  const videos = await db
    .collection("videos")
    .find({ courseId }, { projection: { description: 0 } })
    .sort({ order: 1, _id: 1 })
    .toArray();

  return toPlain({ course, videos });
}
