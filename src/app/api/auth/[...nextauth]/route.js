import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { MongoClient } from "mongodb";

// initialize MongoDB client
const client = new MongoClient(process.env.MONGODB_URI);

// secret for NextAuth
const secret = process.env.NEXTAUTH_SECRET;

if (!secret) throw new Error("NEXTAUTH_SECRET is not defined");

// database connection function
async function getDatabase() {
  if (!client.isConnected?.()) await client.connect();
  return client.db("users");
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
