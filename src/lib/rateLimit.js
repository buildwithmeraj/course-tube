import { getCoursesDB } from "./getDB";

// Fixed-window rate limiter kept in Mongo rather than process memory, so the
// limit holds across the serverless instances a deployment spins up.
//
// Expired documents are harmless but are not reaped automatically; the TTL
// index for that is created by `npm run create-indexes`.
export async function checkRateLimit({ key, limit, windowMs }) {
  const db = await getCoursesDB();
  const col = db.collection("rateLimits");
  const now = new Date();

  // Count this request against the window that is currently open, if any
  const current = await col.findOneAndUpdate(
    { _id: key, expiresAt: { $gt: now } },
    { $inc: { count: 1 } },
    { returnDocument: "after" },
  );

  if (current) {
    return {
      allowed: current.count <= limit,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((current.expiresAt.getTime() - now.getTime()) / 1000),
      ),
    };
  }

  // No open window — start a new one with this request as the first hit
  await col.updateOne(
    { _id: key },
    { $set: { count: 1, expiresAt: new Date(now.getTime() + windowMs) } },
    { upsert: true },
  );

  return { allowed: true, retryAfterSeconds: Math.ceil(windowMs / 1000) };
}

// Best-effort client address for rate-limit keying
export function getClientIp(req) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}
