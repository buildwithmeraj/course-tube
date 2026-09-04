"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaRegTrashCan, FaRegNoteSticky } from "react-icons/fa6";
import { MAX_NOTE_LENGTH } from "@/lib/limits";

const stamp = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
};

// Notes are pinned to a moment in a video: writing one captures the play head,
// clicking one seeks back to it.
const VideoNotes = ({ notes, onAdd, onDelete, onSeek, disabled }) => {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const value = text.trim();
    if (!value || saving) return;

    setSaving(true);
    const ok = await onAdd(value);
    setSaving(false);

    if (ok) {
      setText("");
    } else {
      toast.error("Could not save that note");
    }
  };

  return (
    <div className="collapse bg-base-100 border-base-300 border backdrop-blur-lg">
      <input type="checkbox" />
      <div className="collapse-title font-semibold flex items-center gap-2">
        <FaRegNoteSticky size={18} />
        Notes
        {notes.length > 0 && (
          <span className="badge badge-sm badge-info badge-soft">
            {notes.length}
          </span>
        )}
      </div>
      <div className="collapse-content">
        <form onSubmit={submit} className="flex gap-2">
          <input
            type="text"
            className="input input-sm flex-1"
            placeholder="Note at the current moment…"
            value={text}
            maxLength={MAX_NOTE_LENGTH}
            onChange={(event) => setText(event.target.value)}
            disabled={disabled}
          />
          <button
            type="submit"
            className="btn btn-sm btn-primary"
            disabled={disabled || saving || !text.trim()}
          >
            {saving ? "Saving…" : "Add"}
          </button>
        </form>

        {notes.length === 0 ? (
          <p className="mt-3 text-sm text-base-content/60">
            No notes on this video yet.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-1">
            {notes.map((note) => (
              <li
                key={note._id}
                className="flex items-start gap-2 rounded px-2 py-1.5 hover:bg-base-200"
              >
                <button
                  type="button"
                  onClick={() => onSeek?.(note.seconds)}
                  className="font-mono text-xs text-info pt-0.5 shrink-0 hover:underline"
                  aria-label={`Jump to ${stamp(note.seconds)}`}
                >
                  {stamp(note.seconds)}
                </button>
                <span className="flex-1 text-sm whitespace-pre-wrap break-words">
                  {note.text}
                </span>
                <button
                  type="button"
                  onClick={() => onDelete(note._id)}
                  className="btn btn-ghost btn-xs text-error shrink-0"
                  aria-label="Delete note"
                >
                  <FaRegTrashCan />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default VideoNotes;
