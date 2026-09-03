import { getCoursesDB } from "./getDB";

// Shared read queries, used by both the route handlers and the Server
// Components that render the public pages. Server Components call these
// directly instead of fetching their own API over HTTP.

// ObjectId and Date are not serializable across the server/client boundary
export const toPlain = (value) => JSON.parse(JSON.stringify(value));

const sortStageFor = (sortBy) => {
  switch (sortBy) {
    case "enrollCount":
      return [{ $sort: { enrollCount: -1 } }];
    case "totalCount":
      return [{ $sort: { totalCount: -1 } }];
    case "createdAt":
      return [{ $sort: { createdAt: -1 } }];
    case "updatedAt":
      return [{ $sort: { updatedAt: -1 } }];
    default:
      return [];
  }
};

export const coursesPipeline = ({ filter = {}, sortBy, limit }) => [
  { $match: filter },
  {
    $lookup: {
      from: "enrolls",
      localField: "_id",
      foreignField: "courseId",
      as: "enrolls",
    },
  },
  { $addFields: { enrollCount: { $size: "$enrolls" } } },
  // Only the count is ever used, so the array itself never leaves the database
  { $project: { enrolls: 0 } },
  ...sortStageFor(sortBy),
  { $limit: limit },
];

export async function listCourses({ filter = {}, sortBy, limit = 1000 } = {}) {
  const db = await getCoursesDB();
  return db
    .collection("courses")
    .aggregate(coursesPipeline({ filter, sortBy, limit }))
    .toArray();
}

// Public listings only ever show approved courses
export async function listApprovedCourses({ sortBy, limit = 1000 } = {}) {
  return listCourses({ filter: { approved: true }, sortBy, limit });
}

const categoriesPipeline = (match) => [
  ...(match ? [{ $match: match }] : []),
  {
    $addFields: {
      courseObjectIds: {
        $map: { input: "$courseIds", as: "id", in: { $toObjectId: "$$id" } },
      },
    },
  },
  {
    $lookup: {
      from: "courses",
      let: { ids: "$courseObjectIds" },
      pipeline: [
        {
          $match: {
            $expr: { $in: ["$_id", { $ifNull: ["$$ids", []] }] },
            approved: true,
          },
        },
      ],
      as: "courses",
    },
  },
  { $project: { courseObjectIds: 0 } },
];

export async function listCategories() {
  const db = await getCoursesDB();
  return db
    .collection("categories")
    .aggregate([...categoriesPipeline(null), { $sort: { createdAt: -1 } }])
    .toArray();
}

export async function getCategory(objectId) {
  const db = await getCoursesDB();
  return db
    .collection("categories")
    .aggregate(categoriesPipeline({ _id: objectId }))
    .next();
}

export async function getPlatformStats() {
  const db = await getCoursesDB();

  const [categoriesCount, coursesCount, enrollsCount, videosCount, duration] =
    await Promise.all([
      db.collection("categories").countDocuments(),
      db.collection("courses").countDocuments(),
      db.collection("enrolls").countDocuments(),
      db.collection("videos").countDocuments(),
      db
        .collection("videos")
        .aggregate([
          {
            $group: {
              _id: null,
              total: { $sum: { $ifNull: ["$durationSeconds", 0] } },
            },
          },
        ])
        .toArray(),
    ]);

  return {
    categoriesCount,
    coursesCount,
    enrollsCount,
    videosCount,
    totalVideoDurationSeconds: duration[0]?.total || 0,
  };
}
