import clientPromise from "./db";

// The app spans two databases on the same cluster: `users` holds accounts,
// `courses` holds everything else. Route code should go through these helpers
// rather than repeating the database names.
export async function getDB(name) {
  // Without a name the driver falls back to the connection string's default
  // database — `test` here — which silently returns empty collections.
  if (!name) {
    throw new Error("getDB requires a database name; use getUsersDB/getCoursesDB");
  }

  const client = await clientPromise;
  return client.db(name);
}

export const getUsersDB = () => getDB("users");
export const getCoursesDB = () => getDB("courses");
