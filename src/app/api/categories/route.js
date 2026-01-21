import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("courses");

    const categories = await db
      .collection("categories")
      .aggregate([
        {
          // Convert string IDs to ObjectId
          $addFields: {
            courseObjectIds: {
              $map: {
                input: "$courseIds",
                as: "id",
                in: { $toObjectId: "$$id" },
              },
            },
          },
        },
        {
          $lookup: {
            from: "courses",
            localField: "courseObjectIds",
            foreignField: "_id",
            as: "courses",
          },
        },
        {
          $project: {
            courseObjectIds: 0,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])
      .toArray();

    return NextResponse.json(categories, { status: 200 });
  } catch (err) {
    console.error("Error fetching categories:", err);
    return NextResponse.json(
      { message: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title, description, courseIds } = await req.json();

    if (!title?.trim()) {
      return NextResponse.json(
        { message: "Title is required" },
        { status: 400 },
      );
    }

    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      return NextResponse.json(
        { message: "At least one course is required" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("courses");
    const categoriesCol = db.collection("categories");

    const existing = await categoriesCol.findOne({ title });
    if (existing) {
      return NextResponse.json(
        { message: "Category already exists" },
        { status: 409 },
      );
    }

    const result = await categoriesCol.insertOne({
      title,
      description: description || "",
      courseIds,
    });

    return NextResponse.json(
      {
        message: "Category added successfully",
        categoryId: result.insertedId,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
