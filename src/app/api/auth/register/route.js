import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

let clientPromise;
if (!global._mongoClientPromise) {
  const client = new MongoClient(process.env.MONGODB_URI);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export async function POST(request) {
  try {
    const { name, email, password, photo } = await request.json();
    if (!name || !email || !password || !photo)
      return NextResponse.json(
        { message: "All fields required" },
        { status: 400 }
      );

    const client = await clientPromise;
    const db = client.db("users");
    const usersCollection = db.collection("users");

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser)
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await usersCollection.insertOne({
      name,
      email,
      password: hashedPassword,
      image: photo,
      provider: "credentials",
      role: "user",
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: "User created successfully", userId: result.insertedId },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
