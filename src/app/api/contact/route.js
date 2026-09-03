import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const LIMITS = {
  name: 100,
  email: 254,
  subject: 150,
  message: 5000,
};

// The form is public, so cap how often one address may send
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;

// Everything below is interpolated into an HTML email
const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export async function POST(req) {
  try {
    const { name, email, subject, message } = await req.json();

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 },
      );
    }

    for (const [field, max] of Object.entries(LIMITS)) {
      const value = { name, email, subject, message }[field];
      if (typeof value !== "string" || value.trim().length === 0) {
        return NextResponse.json(
          { message: `${field} is required` },
          { status: 400 },
        );
      }
      if (value.length > max) {
        return NextResponse.json(
          { message: `${field} must be ${max} characters or fewer` },
          { status: 400 },
        );
      }
    }

    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json(
        { message: "Enter a valid email address" },
        { status: 400 },
      );
    }

    const { allowed, retryAfterSeconds } = await checkRateLimit({
      key: `contact:${getClientIp(req)}`,
      limit: RATE_LIMIT,
      windowMs: RATE_WINDOW_MS,
    });

    if (!allowed) {
      return NextResponse.json(
        {
          message:
            "Too many messages sent from this address. Try again later.",
        },
        { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
      );
    }

    const safe = {
      name: escapeHtml(name),
      email: escapeHtml(email),
      subject: escapeHtml(subject),
      message: escapeHtml(message).replace(/\n/g, "<br>"),
    };
    const siteName = escapeHtml(process.env.SITE_NAME || "Course Tube");

    // Send email to admin
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `New Contact Form: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${safe.name}</p>
        <p><strong>Email:</strong> ${safe.email}</p>
        <p><strong>Subject:</strong> ${safe.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${safe.message}</p>
      `,
      replyTo: email,
    });

    // Send confirmation email to user
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `We received your message from ${process.env.SITE_NAME}`,
      html: `
        <h2>Thank you for contacting ${siteName}</h2>
        <p>Hi ${safe.name},</p>
        <p>We've received your message and will get back to you as soon as possible.</p>
        <p>Best regards,<br>The ${siteName} Team</p>
      `,
    });

    return NextResponse.json(
      { message: "Email sent successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { message: "Failed to send email" },
      { status: 500 },
    );
  }
}
