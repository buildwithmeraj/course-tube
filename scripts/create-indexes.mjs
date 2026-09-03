// Creates the indexes the app's queries rely on.
//
//   node scripts/create-indexes.mjs          # report what is missing
//   node scripts/create-indexes.mjs --apply  # create them
//
// Safe to re-run: createIndex is idempotent. Unique indexes are only created
// when the collection is checked and found free of duplicates.
import { readFileSync } from "node:fs";
import { MongoClient } from "mongodb";

for (const line of readFileSync(".env", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
}

const apply = process.argv.includes("--apply");

const INDEXES = [
  // db, collection, keys, options, duplicate-check key (for unique indexes)
  ["users", "users", { email: 1 }, { unique: true, name: "email_unique" }, "email"],
  ["courses", "courses", { playlistId: 1 }, { unique: true, name: "playlistId_unique" }, "playlistId"],
  ["courses", "courses", { approved: 1 }, { name: "approved" }, null],
  ["courses", "enrolls", { userEmail: 1 }, { name: "userEmail" }, null],
  ["courses", "enrolls", { courseId: 1, userEmail: 1 }, { unique: true, name: "courseId_userEmail_unique" }, ["courseId", "userEmail"]],
  ["courses", "progress", { courseId: 1, userEmail: 1 }, { unique: true, name: "courseId_userEmail_unique" }, ["courseId", "userEmail"]],
  ["courses", "videos", { courseId: 1, order: 1 }, { name: "courseId_order" }, null],
  ["courses", "videos", { courseId: 1, videoId: 1 }, { unique: true, name: "courseId_videoId_unique" }, ["courseId", "videoId"]],
  ["courses", "rateLimits", { expiresAt: 1 }, { expireAfterSeconds: 0, name: "expiresAt_ttl" }, null],
];

const countDuplicates = async (col, key) => {
  const fields = Array.isArray(key) ? key : [key];
  const id = Object.fromEntries(fields.map((f) => [f, `$${f}`]));
  const res = await col
    .aggregate([
      { $group: { _id: id, n: { $sum: 1 } } },
      { $match: { n: { $gt: 1 } } },
      { $count: "groups" },
    ])
    .toArray();
  return res[0]?.groups || 0;
};

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();

let created = 0;
let blocked = 0;

for (const [dbName, colName, keys, options, dupKey] of INDEXES) {
  const col = client.db(dbName).collection(colName);
  const label = `${dbName}.${colName} ${JSON.stringify(keys)}`;

  // A collection that has never been written to has no namespace yet
  const existing = await col.indexes().catch((err) => {
    if (err.codeName === "NamespaceNotFound") return [];
    throw err;
  });

  if (existing.some((i) => JSON.stringify(i.key) === JSON.stringify(keys))) {
    console.log(`  exists   ${label}`);
    continue;
  }

  if (options.unique && dupKey) {
    const dupes = await countDuplicates(col, dupKey);
    if (dupes > 0) {
      console.log(`  BLOCKED  ${label} — ${dupes} duplicate group(s); resolve before adding a unique index`);
      blocked++;
      continue;
    }
  }

  if (!apply) {
    console.log(`  missing  ${label}`);
    created++;
    continue;
  }

  await col.createIndex(keys, options);
  console.log(`  created  ${label}`);
  created++;
}

console.log(
  apply
    ? `\n${created} index(es) created, ${blocked} blocked.`
    : `\n${created} index(es) missing, ${blocked} blocked. Re-run with --apply to create them.`,
);

await client.close();
