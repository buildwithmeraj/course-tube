// Seeds `language` on courses from title heuristics.
//
//   node scripts/backfill-course-languages.mjs          # report
//   node scripts/backfill-course-languages.mjs --apply  # write
//
// Only unambiguous matches are set. Everything else is left unset so an admin
// can choose, rather than guessing wrong and burying it.
import { readFileSync } from "node:fs";
import { MongoClient } from "mongodb";
import { guessLanguage, languageLabel } from "../src/lib/languages.js";

for (const line of readFileSync(".env", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
}

const apply = process.argv.includes("--apply");
const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();

const coursesCol = client.db("courses").collection("courses");
const courses = await coursesCol.find({ language: { $exists: false } }).toArray();

const writes = [];
const unset = [];

for (const course of courses) {
  const language = guessLanguage(course.title);
  if (!language) {
    unset.push(course.title);
    continue;
  }
  console.log(`  ${languageLabel(language).padEnd(8)} <- ${course.title.slice(0, 62)}`);
  writes.push({
    updateOne: { filter: { _id: course._id }, update: { $set: { language } } },
  });
}

console.log(`\nresolved: ${writes.length}, left for an admin to set: ${unset.length}`);
unset.forEach((t) => console.log(`  ? ${t.slice(0, 62)}`));

if (!apply) {
  console.log("\nDry run. Re-run with --apply to write.");
} else if (writes.length) {
  const res = await coursesCol.bulkWrite(writes, { ordered: false });
  console.log(`\nApplied: ${res.modifiedCount} course(s) updated.`);
}

await client.close();
