import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { MongoClient } from "mongodb";

// initialize MongoDB client
const client = new MongoClient(process.env.MONGODB_URI);

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
