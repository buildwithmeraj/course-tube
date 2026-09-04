"use client";
import { useState } from "react";
import { MdOutlineFormatListNumbered } from "react-icons/md";

const stamp = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
};

// Chapters are parsed from the video description at ingest, so this is just a
// list of seek targets.
const ChapterList = ({ chapters, onSeek, currentSeconds = 0 }) => {
  const [open, setOpen] = useState(false);

  if (!Array.isArray(chapters) || chapters.length === 0) return null;

  const activeIndex = chapters.reduce(
    (active, chapter, index) =>
      currentSeconds >= chapter.seconds ? index : active,
    -1,
  );

  return (
    <div className="collapse bg-base-100 border-base-300 border backdrop-blur-lg">
      <input
        type="checkbox"
        checked={open}
        onChange={(event) => setOpen(event.target.checked)}
      />
      <div className="collapse-title font-semibold flex items-center gap-2">
        <MdOutlineFormatListNumbered size={20} />
        Chapters
        <span className="badge badge-sm badge-info badge-soft">
          {chapters.length}
        </span>
      </div>
      <div className="collapse-content">
        <ol className="flex flex-col">
          {chapters.map((chapter, index) => (
            <li key={`${chapter.seconds}-${index}`}>
              <button
                type="button"
                onClick={() => onSeek?.(chapter.seconds)}
                className={`w-full text-left text-sm py-1.5 px-2 rounded hover:bg-base-200 flex gap-3 ${
                  index === activeIndex ? "text-info font-semibold" : ""
                }`}
              >
                <span className="font-mono text-xs opacity-70 pt-0.5 shrink-0">
                  {stamp(chapter.seconds)}
                </span>
                <span className="flex-1">{chapter.label}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default ChapterList;
