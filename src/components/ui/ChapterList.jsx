"use client";

const stamp = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
};

// Chapters are parsed from the video description at ingest, so this is just a
// list of seek targets. The panel chrome belongs to the tab strip that hosts
// it, not here.
const ChapterList = ({ chapters, onSeek, currentSeconds = 0 }) => {
  if (!Array.isArray(chapters) || chapters.length === 0) {
    return (
      <p className="text-sm text-base-content/60">
        This video has no chapters. They are read from timestamps in the
        video&rsquo;s description.
      </p>
    );
  }

  const activeIndex = chapters.reduce(
    (active, chapter, index) =>
      currentSeconds >= chapter.seconds ? index : active,
    -1,
  );

  return (
    <ol className="flex flex-col">
      {chapters.map((chapter, index) => (
        <li key={`${chapter.seconds}-${index}`}>
          <button
            type="button"
            onClick={() => onSeek?.(chapter.seconds)}
            className={`flex w-full gap-3 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-base-200 ${
              index === activeIndex ? "bg-base-200 font-semibold text-info" : ""
            }`}
          >
            <span className="shrink-0 pt-0.5 font-mono text-xs opacity-70">
              {stamp(chapter.seconds)}
            </span>
            <span className="flex-1">{chapter.label}</span>
          </button>
        </li>
      ))}
    </ol>
  );
};

export default ChapterList;
