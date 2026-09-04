"use client";
import Image from "next/image";
import React, { useState } from "react";
import { FaMagnifyingGlass, FaCheck } from "react-icons/fa6";
import { IoWarning } from "react-icons/io5";

// Discovery in front of the URL field, not instead of it. Submit-only on
// purpose: a debounced type-ahead would spend the day's YouTube search budget
// in a couple of minutes, and that budget is shared with importing.
const PlaylistSearch = ({ onPick, pickedId }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [notice, setNotice] = useState(null);

  const search = async (event) => {
    event.preventDefault();
    const q = query.trim();
    if (q.length < 3) {
      setNotice("Type at least 3 characters.");
      return;
    }

    setSearching(true);
    setNotice(null);

    try {
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();

      if (!res.ok) {
        setResults(null);
        setNotice(data.message || "Search failed.");
        return;
      }

      setResults(data.results || []);
    } catch {
      setResults(null);
      setNotice("Search failed. Paste a playlist URL instead.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="eyebrow" htmlFor="yt-search">
          Search YouTube
        </label>
        <div className="flex gap-2">
          <input
            id="yt-search"
            type="search"
            className="input w-full"
            placeholder="react course bangla"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              // The panel is one <form>; Enter here must not submit the import
              if (event.key === "Enter") search(event);
            }}
          />
          <button
            type="button"
            onClick={search}
            className="btn btn-primary"
            disabled={searching}
          >
            <FaMagnifyingGlass size={14} />
            {searching ? "Searching…" : "Search"}
          </button>
        </div>
      </div>

      {notice && (
        <p className="alert alert-warning alert-soft py-2 text-sm">
          <IoWarning className="inline" />
          {notice}
        </p>
      )}

      {results?.length === 0 && (
        <p className="text-sm text-base-content/60">
          Nothing found. Try different words, or paste a URL below.
        </p>
      )}

      {results?.length > 0 && (
        <ul className="max-h-80 divide-y divide-hairline overflow-y-auto rounded-box border border-hairline scrollbar-slim">
          {results.map((result) => (
            <li
              key={result.playlistId}
              className="flex items-center gap-3 p-2"
            >
              <span className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-field bg-base-300">
                {result.thumbnail && (
                  <Image
                    src={result.thumbnail}
                    alt=""
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                )}
              </span>

              <span className="min-w-0 flex-1">
                <span className="card-heading line-clamp-2 block text-sm">
                  {result.title}
                </span>
                <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-base-content/60">
                  <span className="truncate">{result.channelTitle}</span>
                  <span className="figure-text">
                    {result.totalCount} videos
                  </span>
                </span>
              </span>

              {result.alreadyAdded ? (
                <span className="badge badge-sm badge-success badge-soft shrink-0">
                  Added
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onPick(result)}
                  className={`btn btn-xs shrink-0 ${
                    pickedId === result.playlistId
                      ? "btn-success btn-soft"
                      : "btn-primary btn-soft"
                  }`}
                >
                  {pickedId === result.playlistId ? (
                    <>
                      <FaCheck size={10} />
                      Chosen
                    </>
                  ) : (
                    "Use"
                  )}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PlaylistSearch;
