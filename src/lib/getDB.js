import clientPromise from "./db";

export async function getDB() {
  const client = await clientPromise;
  return client.db("users");
}
