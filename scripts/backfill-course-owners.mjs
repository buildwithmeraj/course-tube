// Adds `ownerEmail` to courses that predate the field.
//
//   node scripts/backfill-course-owners.mjs          # report
//   node scripts/backfill-course-owners.mjs --apply  # write
//
// Ownership used to be implied rather than stored: creating a course also
// created an enrolment for the uploader, so the earliest enrolment for a course
// identifies who added it. That inference is only reliable for the first
// enrolment, which is exactly what this reads.
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
const coursesCol = db.collection("courses");
const enrollsCol = db.collection("enrolls");

const courses = await coursesCol
  .find({ ownerEmail: { $exists: false } })
  .toArray();

console.log(`courses without ownerEmail: ${courses.length}\n`);

let resolved = 0;
const unresolved = [];
const writes = [];

for (const course of courses) {
  // Earliest enrolment wins; the field name was unified partway through, so
  // fall back to createdAt for rows written before that.
  const [first] = await enrollsCol
    .find({ courseId: course._id })
    .sort({ enrolledAt: 1, createdAt: 1, _id: 1 })
    .limit(1)
    .toArray();

  if (!first?.userEmail) {
    unresolved.push(course.title || String(course._id));
    continue;
  }

  resolved++;
  console.log(`  ${first.userEmail.padEnd(34)} <- ${course.title || course._id}`);
  writes.push({
    updateOne: {
      filter: { _id: course._id },
      update: { $set: { ownerEmail: first.userEmail } },
    },
  });
}

console.log(`\nresolvable: ${resolved}`);
if (unresolved.length) {
  console.log(`no enrolment found for ${unresolved.length} course(s):`);
  unresolved.forEach((t) => console.log(`  - ${t}`));
  console.log("  (these stay unowned; they count against nobody's limit)");
}

if (!apply) {
  console.log("\nDry run. Re-run with --apply to write.");
} else if (writes.length) {
  const res = await coursesCol.bulkWrite(writes, { ordered: false });
  console.log(`\nApplied: ${res.modifiedCount} course(s) updated.`);
} else {
  console.log("\nNothing to write.");
}

await client.close();
