import { getCoursesDB } from "./getDB";
import {
  DAILY_QUOTA_LIMIT,
  QUOTA_BUDGET,
  SEARCH_QUOTA_BUDGET,
} from "./limits";

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
export async function chargeQuota(units = 1, bucket = null) {
  const db = await getCoursesDB();
  const col = db.collection("quotaUsage");
  const key = quotaDayKey();

  // Search is counted twice: once against the day's total, so an import can
  // see what discovery has spent, and once against its own sub-budget, so it
  // can be cut off long before it starves importing.
  const inc = bucket === "search" ? { units, searchUnits: units } : { units };

  const doc = await col.findOneAndUpdate(
    { _id: key },
    { $inc: inc, $setOnInsert: { createdAt: new Date() } },
    { upsert: true, returnDocument: "after" },
  );

  const used = doc?.units ?? units;
  const searchUsed = doc?.searchUnits ?? 0;
  const withinSearchBudget =
    bucket !== "search" || searchUsed <= SEARCH_QUOTA_BUDGET;

  return {
    used,
    searchUsed,
    allowed: used <= QUOTA_BUDGET && withinSearchBudget,
    // Which ceiling stopped it, so a caller can say the right thing
    stoppedBy:
      used > QUOTA_BUDGET ? "daily" : withinSearchBudget ? null : "search",
    remaining: Math.max(0, QUOTA_BUDGET - used),
    searchRemaining: Math.max(0, SEARCH_QUOTA_BUDGET - searchUsed),
    budget: QUOTA_BUDGET,
    ceiling: DAILY_QUOTA_LIMIT,
  };
}

// Read-only view, for surfacing the day's usage without spending any
export async function quotaStatus() {
  const db = await getCoursesDB();
  const doc = await db.collection("quotaUsage").findOne({ _id: quotaDayKey() });
  const used = doc?.units ?? 0;
  const searchUsed = doc?.searchUnits ?? 0;

  return {
    used,
    searchUsed,
    remaining: Math.max(0, QUOTA_BUDGET - used),
    searchRemaining: Math.max(0, SEARCH_QUOTA_BUDGET - searchUsed),
    budget: QUOTA_BUDGET,
    ceiling: DAILY_QUOTA_LIMIT,
  };
}
