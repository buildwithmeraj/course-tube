import { getCoursesDB } from "@/lib/getDB";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req, { params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const db = await getCoursesDB();
  const enrollsCol = db.collection("enrolls");

  const enrollment = await enrollsCol.findOne({
    courseId: new ObjectId(id),
    userEmail: session.user.email,
  });

  return NextResponse.json(enrollment);
}

export async function POST(req, { params }) {
  try {
    const { id } = await params;

    // Validate before constructing an ObjectId, which throws on bad input
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid course ID" },
        { status: 400 },
      );
    }

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const db = await getCoursesDB();
    const enrollsCol = db.collection("enrolls");
    const courseId = new ObjectId(id);

    const existing = await enrollsCol.findOne({
      courseId,
      userEmail: session.user.email,
    });

    if (existing) {
      return NextResponse.json({ message: "Already enrolled" });
    }

    await enrollsCol.insertOne({
      courseId,
      userEmail: session.user.email,
      enrolledAt: new Date(),
    });

    return NextResponse.json({ message: "Enrolled successfully" });
  } catch (err) {
    console.error("Error enrolling in course:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
