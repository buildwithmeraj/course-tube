import clientPromise from "./db";

// The app spans two databases on the same cluster: `users` holds accounts,
// `courses` holds everything else. Route code should go through these helpers
// rather than repeating the database names.
export async function getDB(name) {
  const client = await clientPromise;
  return client.db(name);
}

export const getUsersDB = () => getDB("users");
export const getCoursesDB = () => getDB("courses");
