import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";
import { getCoursesDB } from "./getDB";
import { toPlain } from "./queries";

// Everything the "My courses" page needs in one aggregation: the course, how
// many of its watchable lessons this user has finished, and when they last
// touched it. Fetching progress per course would be one request each.
export async function listEnrolledWithProgress() {
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;
  if (!userEmail) return [];

  const db = await getCoursesDB();

  const rows = await db
    .collection("enrolls")
    .aggregate([
      { $match: { userEmail } },
      {
        $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id",
          as: "course",
        },
      },
      { $unwind: "$course" },
      {
        // Unavailable lessons can never be watched, so they must not count
        // towards the denominator
        $lookup: {
          from: "videos",
          let: { cid: "$course._id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$courseId", "$$cid"] },
                unavailable: { $ne: true },
              },
            },
            { $count: "n" },
          ],
          as: "watchable",
        },
      },
      {
        $lookup: {
          from: "videoProgress",
          let: { cid: "$course._id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$courseId", "$$cid"] },
                    { $eq: ["$userEmail", userEmail] },
                  ],
                },
                completedAt: { $ne: null },
              },
            },
            { $count: "n" },
          ],
          as: "finished",
        },
      },
      {
        $lookup: {
          from: "videoProgress",
          let: { cid: "$course._id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$courseId", "$$cid"] },
                    { $eq: ["$userEmail", userEmail] },
                  ],
                },
              },
            },
            { $sort: { updatedAt: -1 } },
            { $limit: 1 },
            { $project: { videoId: 1, updatedAt: 1 } },
          ],
          as: "last",
        },
      },
      {
        $project: {
          course: 1,
          enrolledAt: { $ifNull: ["$enrolledAt", "$createdAt"] },
          totalCount: { $ifNull: [{ $first: "$watchable.n" }, 0] },
          completedCount: { $ifNull: [{ $first: "$finished.n" }, 0] },
          lastVideoId: { $first: "$last.videoId" },
          lastActiveAt: { $first: "$last.updatedAt" },
        },
      },
    ])
    .toArray();

  const plain = toPlain(rows);

  // In progress first (most recent on top), then untouched, then finished —
  // which is the order someone actually wants to act on them.
  const rank = (row) => {
    if (row.totalCount > 0 && row.completedCount >= row.totalCount) return 2;
    return row.lastActiveAt ? 0 : 1;
  };

  return plain.sort((a, b) => {
    const byRank = rank(a) - rank(b);
    if (byRank !== 0) return byRank;
    const at = new Date(a.lastActiveAt || a.enrolledAt || 0).getTime();
    const bt = new Date(b.lastActiveAt || b.enrolledAt || 0).getTime();
    return bt - at;
  });
}
