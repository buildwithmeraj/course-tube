import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getCoursesDB } from "@/lib/getDB";

const getUserPlaylist = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  try {
    const db = await getCoursesDB();

    const enrollsCol = db.collection("enrolls");

    const playlists = await enrollsCol
      .aggregate([
        { $match: { userEmail: session.user.email } },
        {
          $lookup: {
            from: "courses",
            localField: "courseId",
            foreignField: "_id",
            as: "course",
          },
        },
        { $unwind: "$course" },
        // Enrolments created before the field was unified carry createdAt
        {
          $addFields: {
            enrolledAt: { $ifNull: ["$enrolledAt", "$createdAt"] },
          },
        },
        { $sort: { enrolledAt: -1 } },
      ])
      .toArray();

    return playlists;
  } catch (err) {
    console.error("Error fetching user playlists:", err);
    throw err;
  }
};

export default getUserPlaylist;
