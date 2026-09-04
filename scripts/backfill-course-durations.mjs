// Sums video durations onto each course as `totalDurationSeconds`.
//
//   node scripts/backfill-course-durations.mjs          # report
//   node scripts/backfill-course-durations.mjs --apply  # write
//
// Denormalised so course listings do not have to aggregate over every video.
// New and re-synced courses maintain it automatically.
import { readFileSync } from "node:fs";
import { MongoClient } from "mongodb";

for (const line of readFileSync(".env", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
}

const apply = process.argv.includes("--apply");
const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();

const db = client.db("courses");

const totals = await db
  .collection("videos")
  .aggregate([
    {
      $group: {
        _id: "$courseId",
        seconds: { $sum: { $ifNull: ["$durationSeconds", 0] } },
        missing: {
          $sum: {
            $cond: [{ $gt: [{ $ifNull: ["$durationSeconds", 0] }, 0] }, 0, 1],
          },
        },
      },
    },
  ])
  .toArray();

const fmt = (s) => `${Math.floor(s / 3600)}h ${Math.round((s % 3600) / 60)}m`;
let incomplete = 0;

for (const t of totals) {
  const note = t.missing ? `  (${t.missing} video(s) missing a duration)` : "";
  if (t.missing) incomplete++;
  console.log(`  ${fmt(t.seconds).padStart(8)}  ${t._id}${note}`);
}

console.log(`\ncourses: ${totals.length}, of which ${incomplete} have gaps`);

if (!apply) {
  console.log("\nDry run. Re-run with --apply to write.");
} else {
  const res = await db.collection("courses").bulkWrite(
    totals.map((t) => ({
      updateOne: {
        filter: { _id: t._id },
        update: { $set: { totalDurationSeconds: t.seconds } },
      },
    })),
    { ordered: false },
  );
  console.log(`\nApplied: ${res.modifiedCount} course(s) updated.`);
}

await client.close();
