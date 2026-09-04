// Derives `chapters` and `unavailable` for videos already in the database.
//
//   node scripts/backfill-chapters.mjs          # report
//   node scripts/backfill-chapters.mjs --apply  # write
//
// Descriptions are already stored, so this costs no YouTube quota. New and
// re-synced videos get both fields at ingest.
import { readFileSync } from "node:fs";
import { MongoClient } from "mongodb";
import { parseChapters, isUnavailableVideo } from "../src/lib/chapters.js";

for (const line of readFileSync(".env", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
}

const apply = process.argv.includes("--apply");
const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();

const videos = client.db("courses").collection("videos");
const all = await videos
  .find({}, { projection: { description: 1, durationSeconds: 1, title: 1, thumbnail: 1 } })
  .toArray();

const writes = [];
let withChapters = 0;
let chapterTotal = 0;
let unavailableTotal = 0;

for (const video of all) {
  const chapters = parseChapters(video.description, video.durationSeconds);
  const unavailable = isUnavailableVideo(video);

  if (chapters.length) {
    withChapters++;
    chapterTotal += chapters.length;
  }
  if (unavailable) unavailableTotal++;

  writes.push({
    updateOne: {
      filter: { _id: video._id },
      update: { $set: { chapters, unavailable } },
    },
  });
}

console.log(`videos scanned:        ${all.length}`);
console.log(`with a chapter list:   ${withChapters}`);
console.log(`chapters parsed:       ${chapterTotal}`);
console.log(`detected unavailable:  ${unavailableTotal}`);

if (!apply) {
  console.log("\nDry run. Re-run with --apply to write.");
} else {
  const res = await videos.bulkWrite(writes, { ordered: false });
  console.log(`\nApplied: ${res.modifiedCount} video(s) updated.`);
}

await client.close();
