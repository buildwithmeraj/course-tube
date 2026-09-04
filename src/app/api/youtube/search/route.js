import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCoursesDB } from "@/lib/getDB";
import { checkRateLimit } from "@/lib/rateLimit";
import { searchPlaylists, YouTubeError } from "@/lib/youtubeApi";
import { SEARCH_CACHE_HOURS, YOUTUBE_SEARCH_RATE } from "@/lib/limits";

export const dynamic = "force-dynamic";

const MIN_QUERY = 3;
const MAX_QUERY = 100;

// Case and spacing should not buy a second 100-unit search.
const normalize = (raw) => raw.trim().replace(/\s+/g, " ").toLowerCase();

// Which of these are already in the catalogue, so a result can say so instead
// of sending someone down an import that will be rejected as a duplicate.
const markExisting = async (db, results) => {
  if (results.length === 0) return results;

  const existing = await db
    .collection("courses")
    .find(
      { playlistId: { $in: results.map((r) => r.playlistId) } },
      { projection: { playlistId: 1, approved: 1 } },
    )
    .toArray();

  const byId = Object.fromEntries(existing.map((c) => [c.playlistId, c]));

  return results.map((result) => ({
    ...result,
    alreadyAdded: Boolean(byId[result.playlistId]),
  }));
};

export async function GET(req) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const raw = req.nextUrl.searchParams.get("q") || "";
  const query = normalize(raw);

  if (query.length < MIN_QUERY || query.length > MAX_QUERY) {
    return NextResponse.json(
      { message: `Search for between ${MIN_QUERY} and ${MAX_QUERY} characters.` },
      { status: 400 },
    );
  }

  const db = await getCoursesDB();
  const cache = db.collection("youtubeSearches");

  // Cache first, and deliberately before the rate limit: a cached answer costs
  // nothing at YouTube, so there is no reason to charge anyone for it.
  const hit = await cache.findOne({ _id: query, expiresAt: { $gt: new Date() } });
  if (hit) {
    return NextResponse.json({
      results: await markExisting(db, hit.results || []),
      cached: true,
    });
  }

  const limit = await checkRateLimit({
    key: `ytsearch:${session.user.email}`,
    ...YOUTUBE_SEARCH_RATE,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      {
        message: `You can run ${YOUTUBE_SEARCH_RATE.limit} new searches an hour. Paste a playlist URL instead — adding still works.`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  try {
    const results = await searchPlaylists(query);

    await cache.updateOne(
      { _id: query },
      {
        $set: {
          results,
          expiresAt: new Date(Date.now() + SEARCH_CACHE_HOURS * 3600 * 1000),
        },
      },
      { upsert: true },
    );

    return NextResponse.json({
      results: await markExisting(db, results),
      cached: false,
    });
  } catch (err) {
    if (err instanceof YouTubeError) {
      // 503 here is the search budget, not a failure: the URL field below it
      // still works, so the client shows a notice rather than an error.
      return NextResponse.json(
        { message: err.message, budgetExhausted: err.status === 503 },
        { status: err.status },
      );
    }

    console.error("YouTube search failed:", err);
    return NextResponse.json({ message: "Search failed" }, { status: 502 });
  }
}
