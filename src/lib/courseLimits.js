import {
  MAX_COURSES_OWNED,
  MAX_COURSES_PER_DAY,
  MAX_PENDING_PER_USER,
  MAX_PENDING_QUEUE,
  isAdmin,
} from "./limits";

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

// Returns null when the user may add another course, or { message, status }
// describing which limit stopped them. Admins skip the per-user caps but not
// the global queue cap, which protects the approval backlog.
export async function checkCourseAddLimits(db, session) {
  const coursesCol = db.collection("courses");

  const pendingQueue = await coursesCol.countDocuments({ approved: false });
  if (pendingQueue >= MAX_PENDING_QUEUE) {
    return {
      status: 503,
      message:
        "The review queue is full right now. Please try adding this course later.",
    };
  }

  if (isAdmin(session)) return null;

  const ownerEmail = session.user.email;

  const owned = await coursesCol.countDocuments({ ownerEmail });
  if (owned >= MAX_COURSES_OWNED) {
    return {
      status: 429,
      message: `You have added the maximum of ${MAX_COURSES_OWNED} courses.`,
    };
  }

  const addedToday = await coursesCol.countDocuments({
    ownerEmail,
    createdAt: { $gte: startOfToday() },
  });
  if (addedToday >= MAX_COURSES_PER_DAY) {
    return {
      status: 429,
      message: `You can add ${MAX_COURSES_PER_DAY} courses per day. Try again tomorrow.`,
    };
  }

  const pending = await coursesCol.countDocuments({
    ownerEmail,
    approved: false,
  });
  if (pending >= MAX_PENDING_PER_USER) {
    return {
      status: 429,
      message: `You have ${pending} courses waiting for review. Please wait for those before adding more.`,
    };
  }

  return null;
}
