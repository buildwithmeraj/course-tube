// Every limit in one place. These exist to protect shared resources — the
// YouTube API quota, storage, and the single moderator's attention — not to
// gate features. They are set so a genuine enthusiast never reaches them and a
// script reaches them immediately.

// Per user
export const MAX_COURSES_OWNED = 50; // twice the entire current catalogue
export const MAX_COURSES_PER_DAY = 10;
export const MAX_PENDING_PER_USER = 5;
export const MAX_SYNCS_PER_DAY = 5;

export const MAX_NOTES_PER_COURSE = 500;
export const MAX_NOTE_LENGTH = 2000;

// Per course
export const MAX_COURSE_VIDEOS = 300; // largest existing course is 121

// Global
export const MAX_PENDING_QUEUE = 200; // protects the approval queue

// YouTube Data API: 10,000 units/day, reset at midnight Pacific. Stop ingesting
// below the ceiling so browsing keeps working for the rest of the day.
export const DAILY_QUOTA_LIMIT = 10000;
export const QUOTA_BUDGET = 8000;

// Per IP
export const RATE_LIMITS = {
  signIn: { limit: 20, windowMs: 15 * 60 * 1000 },
  register: { limit: 10, windowMs: 60 * 60 * 1000 },
  contact: { limit: 5, windowMs: 60 * 60 * 1000 },
  search: { limit: 60, windowMs: 60 * 1000 },
};

// Admins bypass the per-user caps, but never the quota budget — that protects
// an external resource that does not care who is spending it.
export const isAdmin = (session) => session?.user?.role === "admin";
