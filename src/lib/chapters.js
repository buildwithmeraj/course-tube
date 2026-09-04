// Parses chapter markers out of a YouTube description.
//
// Creators write them as lines like "12:34 Topic", "00:00 - Intro" or
// "(1:02:03) Deployment". Anything that does not look like a real chapter list
// is rejected rather than guessed at.

const LINE_PATTERN =
  /^\s*[([]?\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*[)\]]?\s*[-–—:|.]?\s*(.*)$/;

// Some creators write ranges: "0:00 - 1:10 - Introduction". The second stamp
// is the end of the chapter, not part of its name.
const RANGE_END_PATTERN = /^\d{1,2}:\d{2}(?::\d{2})?\s*[-–—:|.]?\s*/;

const MIN_CHAPTERS = 3;
const MAX_CHAPTERS = 200;
const MAX_LABEL_LENGTH = 120;

const toSeconds = (stamp) => {
  const parts = stamp.split(":").map(Number);
  if (parts.some((part) => Number.isNaN(part))) return null;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return null;
};

export function parseChapters(description, durationSeconds = 0) {
  if (typeof description !== "string" || description.length === 0) return [];

  const found = [];

  for (const line of description.split("\n")) {
    const match = line.match(LINE_PATTERN);
    if (!match) continue;

    const seconds = toSeconds(match[1]);
    if (seconds === null) continue;

    const label = match[2]
      .trim()
      .replace(RANGE_END_PATTERN, "")
      .trim()
      .replace(/\s+/g, " ")
      .slice(0, MAX_LABEL_LENGTH);
    if (!label) continue;

    // A timestamp past the end of the video is a reference to something else
    if (durationSeconds > 0 && seconds > durationSeconds) continue;

    found.push({ seconds, label });
  }

  if (found.length < MIN_CHAPTERS) return [];

  // Chapter lists run forwards; anything else is prose that happens to contain
  // times, so drop entries that go backwards rather than reordering them.
  const ordered = [];
  let previous = -1;

  for (const chapter of found) {
    if (chapter.seconds <= previous) continue;
    ordered.push(chapter);
    previous = chapter.seconds;
  }

  if (ordered.length < MIN_CHAPTERS) return [];

  return ordered.slice(0, MAX_CHAPTERS);
}

// YouTube keeps removed entries in a playlist with a placeholder title
const PLACEHOLDER_TITLES = /^\s*\[?(deleted|private|unavailable) video\]?\s*$/i;

export function isUnavailableVideo({ title, durationSeconds, thumbnail }) {
  if (PLACEHOLDER_TITLES.test(String(title || ""))) return true;
  // A live entry always resolves to a duration and a thumbnail
  return !durationSeconds && !thumbnail;
}
