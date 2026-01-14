import clientPromise from "@/lib/db";

const getAllPlaylists = async () => {
  try {
    const client = await clientPromise;
    const db = client.db("courses");

    const playlists = await db.collection("courses").find({}).toArray();

    return playlists;
  } catch (err) {
    console.error("Error fetching all playlists:", err);
    throw err;
  }
};

export default getAllPlaylists;
