// Expands the legacy high-water-mark progress model into per-video records.
//
//   node scripts/migrate-progress.mjs          # report what would be written
//   node scripts/migrate-progress.mjs --apply  # write it
//
// Legacy shape (collection `progress`), one document per user per course:
//   { courseId, userEmail, finishedVideo }   <- a single video _id
// The pointer means "everything up to and including this video is done", so it
// expands to one record per video at or before that playlist position.
//
// New shape (collection `videoProgress`), one document per user per video:
//   { userEmail, courseId, videoId, completedAt, positionSeconds, updatedAt }
//
// The legacy `progress` collection is left untouched so this is reversible.
import { readFileSync } from "node:fs";
import { MongoClient } from "mongodb";

for (const line of readFileSync(".env", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
}

const apply = process.argv.includes("--apply");
const positionOf = (video) => video?.position ?? video?.order ?? 0;

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();

const db = client.db("courses");
const legacy = await db.collection("progress").find({}).toArray();
const videosCol = db.collection("videos");
const targetCol = db.collection("videoProgress");

const existing = await targetCol.countDocuments().catch(() => 0);
if (existing > 0) {
  console.log(
    `videoProgress already holds ${existing} document(s). This script is not idempotent-safe\n` +
      `against partial runs — inspect before continuing.\n`,
  );
}

console.log(`legacy progress documents: ${legacy.length}\n`);

const writes = [];
const skipped = [];
const now = new Date();

for (const doc of legacy) {
  const label = `${doc.userEmail} / course ${doc.courseId}`;

  if (!doc.finishedVideo) {
    skipped.push(`${label} — no finishedVideo pointer`);
    continue;
  }

  const marker = await videosCol.findOne({
    _id: doc.finishedVideo,
    courseId: doc.courseId,
  });

  if (!marker) {
    skipped.push(`${label} — finishedVideo no longer exists in the course`);
    continue;
  }

  const upTo = positionOf(marker);
  const videos = await videosCol.find({ courseId: doc.courseId }).toArray();
  const completed = videos.filter((v) => positionOf(v) <= upTo);

  console.log(
    `  ${label}\n` +
      `    marker at position ${upTo} of ${videos.length} -> ${completed.length} completed record(s)`,
  );

  for (const video of completed) {
    writes.push({
      updateOne: {
        filter: {
          userEmail: doc.userEmail,
          courseId: doc.courseId,
          videoId: video._id,
        },
        update: {
          $set: {
            userEmail: doc.userEmail,
            courseId: doc.courseId,
            videoId: video._id,
            completedAt: doc.updatedAt || now,
            positionSeconds: 0,
            updatedAt: now,
          },
        },
        upsert: true,
      },
    });
  }
}

console.log(`\nrecords to write: ${writes.length}`);
if (skipped.length) {
  console.log(`skipped: ${skipped.length}`);
  skipped.forEach((s) => console.log(`  - ${s}`));
}

if (!apply) {
  console.log("\nDry run. Re-run with --apply to write.");
} else if (writes.length === 0) {
  console.log("\nNothing to write.");
} else {
  const res = await targetCol.bulkWrite(writes, { ordered: false });
  console.log(
    `\nApplied: ${res.upsertedCount} inserted, ${res.modifiedCount} updated.`,
  );
  console.log(
    `videoProgress now holds ${await targetCol.countDocuments()} document(s).`,
  );
  console.log("The legacy `progress` collection was not modified.");
}

await client.close();
