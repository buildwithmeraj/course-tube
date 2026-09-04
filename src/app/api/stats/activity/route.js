import { getCoursesDB } from "@/lib/getDB";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const DAYS = 182; // roughly six months, which fits a readable grid

// Streaks are a local-time idea: watching at 1am should count for that evening,
// not the next UTC day. The client sends its offset, the way Date reports it.
const timezoneFrom = (offsetMinutes) => {
  const value = Number(offsetMinutes);
  if (!Number.isFinite(value) || Math.abs(value) > 14 * 60) return "+00:00";

  // getTimezoneOffset is inverted relative to the UTC offset
  const total = -value;
  const sign = total < 0 ? "-" : "+";
  const abs = Math.abs(total);
  const pad = (n) => String(n).padStart(2, "0");
  return `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
};

// Same offset Mongo bucketed with, so the filled days line up with the counts
const dayKey = (date, offsetMinutes) =>
  new Date(date.getTime() - offsetMinutes * 60000).toISOString().slice(0, 10);

export async function GET(req) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const rawOffset = Number(req.nextUrl.searchParams.get("tzOffset"));
  const offsetMinutes =
    Number.isFinite(rawOffset) && Math.abs(rawOffset) <= 14 * 60 ? rawOffset : 0;
  const timezone = timezoneFrom(offsetMinutes);
  const db = await getCoursesDB();

  const since = new Date();
  since.setDate(since.getDate() - DAYS);

  const rows = await db
    .collection("videoProgress")
    .aggregate([
      { $match: { userEmail: session.user.email, updatedAt: { $gte: since } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$updatedAt", timezone },
          },
          count: { $sum: 1 },
        },
      },
    ])
    .toArray();

  const counts = new Map(rows.map((row) => [row._id, row.count]));

  // Fill every day so the grid has no gaps
  const days = [];
  const cursor = new Date();
  cursor.setDate(cursor.getDate() - DAYS + 1);

  for (let i = 0; i < DAYS; i++) {
    const key = dayKey(cursor, offsetMinutes);
    days.push({ date: key, count: counts.get(key) || 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  // Current streak runs back from today, tolerating today being empty so far
  let current = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) current++;
    else if (i !== days.length - 1) break;
  }

  let longest = 0;
  let run = 0;
  for (const day of days) {
    run = day.count > 0 ? run + 1 : 0;
    if (run > longest) longest = run;
  }

  const activeDays = days.filter((day) => day.count > 0).length;

  return NextResponse.json({
    days,
    currentStreak: current,
    longestStreak: longest,
    activeDays,
  });
}
