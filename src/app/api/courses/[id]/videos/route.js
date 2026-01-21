import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("courses");

    const videos = await db
      .collection("videos")
      .find({ courseId: new ObjectId(id) })
      .sort({ _id: 1 })
      .toArray();

    return NextResponse.json(videos, { status: 200 });
  } catch (err) {
    console.error("Error fetching videos:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
