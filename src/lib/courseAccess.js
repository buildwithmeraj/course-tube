// A course that is not yet approved is private: only an admin, or a learner
// enrolled in it, may read it. The uploader is enrolled automatically when the
// course is created, so this covers "private to the uploader" as well.
export async function canViewCourse(course, session, db) {
  if (course?.approved) return true;
  if (!session?.user?.email) return false;
  if (session.user.role === "admin") return true;

  const enrollment = await db.collection("enrolls").findOne({
    courseId: course._id,
    userEmail: session.user.email,
  });

  return Boolean(enrollment);
}
