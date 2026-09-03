import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUsersDB } from "@/lib/getDB";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 200;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;

const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 60 * 1000;

export async function POST(request) {
  try {
    const { name, email, password, photo } = await request.json();

    // The browser checks these too; a direct POST must not bypass them
    if (typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { message: "Name must be at least 2 characters" },
        { status: 400 },
      );
    }

    if (name.trim().length > MAX_NAME_LENGTH) {
      return NextResponse.json(
        { message: `Name must be ${MAX_NAME_LENGTH} characters or fewer` },
        { status: 400 },
      );
    }

    if (
      typeof email !== "string" ||
      email.length > MAX_EMAIL_LENGTH ||
      !EMAIL_PATTERN.test(email.trim())
    ) {
      return NextResponse.json(
        { message: "Enter a valid email address" },
        { status: 400 },
      );
    }

    if (
      typeof password !== "string" ||
      password.length < MIN_PASSWORD_LENGTH ||
      password.length > MAX_PASSWORD_LENGTH
    ) {
      return NextResponse.json(
        {
          message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
        },
        { status: 400 },
      );
    }

    // A profile picture is optional in the form, so it is optional here
    if (photo !== undefined && photo !== null && typeof photo !== "string") {
      return NextResponse.json(
        { message: "Invalid profile picture" },
        { status: 400 },
      );
    }

    const { allowed } = await checkRateLimit({
      key: `register:${getClientIp(request)}`,
      limit: RATE_LIMIT,
      windowMs: RATE_WINDOW_MS,
    });

    if (!allowed) {
      return NextResponse.json(
        { message: "Too many attempts. Try again later." },
        { status: 429 },
      );
    }

    // Emails are matched case-insensitively at sign-in, so store them normalised
    const normalisedEmail = email.trim().toLowerCase();

    const db = await getUsersDB();
    const usersCollection = db.collection("users");

    const existingUser = await usersCollection.findOne({
      email: normalisedEmail,
    });

    // Deliberately vague: a distinct "user exists" reply confirms which
    // addresses are registered to anyone who asks
    if (existingUser) {
      return NextResponse.json(
        { message: "Could not create the account with those details" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await usersCollection.insertOne({
      name: name.trim(),
      email: normalisedEmail,
      password: hashedPassword,
      image: typeof photo === "string" ? photo : "",
      provider: "credentials",
      role: "user",
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: "User created successfully", userId: result.insertedId },
      { status: 201 },
    );
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
