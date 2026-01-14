import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/db";

const getUserPlaylist = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  try {
    const client = await clientPromise;
    const db = client.db("courses");

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
        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    return playlists;
  } catch (err) {
    console.error("Error fetching user playlists:", err);
    throw err;
  }
};

export default getUserPlaylist;
