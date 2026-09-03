import { NextResponse } from "next/server";
import { getCoursesDB } from "@/lib/getDB";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(_, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "admin";

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid category id" },
        { status: 400 },
      );
    }

    const db = await getCoursesDB();

    const category = await db
      .collection("categories")
      .aggregate([
        { $match: { _id: new ObjectId(id) } },
        {
          $addFields: {
            courseObjectIds: {
              $map: {
                input: "$courseIds",
                as: "cid",
                in: { $toObjectId: "$$cid" },
              },
            },
          },
        },
        {
          $lookup: {
            from: "courses",
            let: { ids: "$courseObjectIds" },
            pipeline: [
              {
                $match: {
                  $expr: { $in: ["$_id", { $ifNull: ["$$ids", []] }] },
                  ...(isAdmin ? {} : { approved: true }),
                },
              },
            ],
            as: "courses",
          },
        },
        {
          $project: {
            courseObjectIds: 0,
          },
        },
      ])
      .next();

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(category, { status: 200 });
  } catch (err) {
    console.error("GET category error:", err);
    return NextResponse.json(
      { message: "Failed to fetch category" },
      { status: 500 },
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid category id" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const { title, description, courseIds } = body;

    const updateDoc = {
      ...(title && { title: title.trim() }),
      ...(description && { description }),
      ...(Array.isArray(courseIds) && { courseIds }),
      updatedAt: new Date(),
    };

    if (Object.keys(updateDoc).length === 1) {
      return NextResponse.json(
        { message: "No valid fields to update" },
        { status: 400 },
      );
    }

    const db = await getCoursesDB();

    const result = await db
      .collection("categories")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateDoc },
        { returnDocument: "after" },
      );

    if (!result) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Category updated", category: result },
      { status: 200 },
    );
  } catch (err) {
    console.error("UPDATE category error:", err);
    return NextResponse.json(
      { message: "Failed to update category" },
      { status: 500 },
    );
  }
}

export async function DELETE(_, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid category id" },
        { status: 400 },
      );
    }

    const db = await getCoursesDB();

    const result = await db.collection("categories").findOneAndDelete({
      _id: new ObjectId(id),
    });

    if (!result) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Category deleted successfully" },
      { status: 200 },
    );
  } catch (err) {
    console.error("DELETE category error:", err);
    return NextResponse.json(
      { message: "Failed to delete category" },
      { status: 500 },
    );
  }
}
