import { getCoursesDB } from "./getDB";
import { DAILY_QUOTA_LIMIT, QUOTA_BUDGET } from "./limits";

// YouTube resets the daily quota at midnight Pacific, so the counter is keyed
// on the Pacific date rather than UTC — a UTC key would reset up to 8 hours
// early and let a busy evening spill over into the real allowance.
const quotaDayKey = (date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

// Increment first, then judge: an atomic $inc cannot race, and overshooting by
// the number of concurrent requests is harmless inside the headroom we leave
// between QUOTA_BUDGET and the real DAILY_QUOTA_LIMIT.
export async function chargeQuota(units = 1) {
  const db = await getCoursesDB();
  const col = db.collection("quotaUsage");
  const key = quotaDayKey();

  const doc = await col.findOneAndUpdate(
    { _id: key },
    { $inc: { units }, $setOnInsert: { createdAt: new Date() } },
    { upsert: true, returnDocument: "after" },
  );

  const used = doc?.units ?? units;

  return {
    used,
    allowed: used <= QUOTA_BUDGET,
    remaining: Math.max(0, QUOTA_BUDGET - used),
    budget: QUOTA_BUDGET,
    ceiling: DAILY_QUOTA_LIMIT,
  };
}

// Read-only view, for surfacing the day's usage without spending any
export async function quotaStatus() {
  const db = await getCoursesDB();
  const doc = await db.collection("quotaUsage").findOne({ _id: quotaDayKey() });
  const used = doc?.units ?? 0;

  return {
    used,
    remaining: Math.max(0, QUOTA_BUDGET - used),
    budget: QUOTA_BUDGET,
    ceiling: DAILY_QUOTA_LIMIT,
  };
}
