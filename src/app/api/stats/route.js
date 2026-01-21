import clientPromise from "@/lib/db";

export async function GET(req) {
  const client = await clientPromise;
  const db = client.db("courses");

  try {
    // Categories
    const categoriesCount = await db.collection("categories").countDocuments();
    const categoriesCourseAgg = await db
      .collection("categories")
      .aggregate([
        {
          $project: { numCourses: { $size: { $ifNull: ["$courseIds", []] } } },
        },
        { $group: { _id: null, totalCourseRefs: { $sum: "$numCourses" } } },
      ])
      .toArray();
    const totalCourseRefs = categoriesCourseAgg[0]?.totalCourseRefs || 0;

    // Courses
    const coursesCount = await db.collection("courses").countDocuments();
    const approvedCoursesCount = await db
      .collection("courses")
      .countDocuments({ approved: true });
    const totalPlaylistVideosAgg = await db
      .collection("courses")
      .aggregate([
        {
          $group: {
            _id: null,
            totalPlaylistVideos: { $sum: { $ifNull: ["$totalCount", 0] } },
          },
        },
      ])
      .toArray();
    const totalPlaylistVideos =
      totalPlaylistVideosAgg[0]?.totalPlaylistVideos || 0;

    // Enrolls
    const enrollsCount = await db.collection("enrolls").countDocuments();
    const uniqueEnrolledUsers = await db
      .collection("enrolls")
      .distinct("userEmail");
    const uniqueUsersCount = Array.isArray(uniqueEnrolledUsers)
      ? uniqueEnrolledUsers.length
      : 0;

    // Videos
    const videosCount = await db.collection("videos").countDocuments();
    const totalVideoDurationAgg = await db
      .collection("videos")
      .aggregate([
        {
          $group: {
            _id: null,
            totalDurationSeconds: {
              $sum: { $ifNull: ["$durationSeconds", 0] },
            },
          },
        },
      ])
      .toArray();
    const totalVideoDurationSeconds =
      totalVideoDurationAgg[0]?.totalDurationSeconds || 0;

    // Only numbers
    const statsNumbers = {
      categoriesCount,
      totalCourseReferences: totalCourseRefs,
      coursesCount,
      approvedCoursesCount,
      totalPlaylistVideos,
      enrollsCount,
      uniqueUsersCount,
      videosCount,
      totalVideoDurationSeconds,
    };

    return new Response(JSON.stringify(statsNumbers), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
