"use client";
import React, { useState } from "react";
import { LANGUAGES } from "@/lib/languages";
import FormPanel from "@/components/ui/FormPanel";
import PlaylistSearch from "@/components/ui/PlaylistSearch";
import { FaCircleCheck, FaCircleInfo } from "react-icons/fa6";
import { IoWarning } from "react-icons/io5";
import { RiPlayListAddFill } from "react-icons/ri";

const AddCourse = () => {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  // Controlled, so a search result can fill it — the field stays editable and
  // is what the whole feature falls back to when search is unavailable.
  const [url, setUrl] = useState("");

  const pickedId = (() => {
    try {
      return new URL(url).searchParams.get("list");
    } catch {
      return null;
    }
  })();

  const usePlaylist = (result) => {
    setUrl(`https://www.youtube.com/playlist?list=${result.playlistId}`);
    setError(null);
    setSuccess(null);
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const formData = new FormData(e.currentTarget);

      // The server resolves the playlist and fetches its videos from YouTube
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          language: formData.get("language") || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }
      setSuccess(true);
      e.target.reset();
      setUrl("");
    } catch (err) {
      setError(err.message || "Failed to add course");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormPanel
      title="Add a playlist"
      description="Search YouTube for a public playlist, or paste its URL. Its videos, durations and chapters are fetched in the background."
      width="md"
    >
      <PlaylistSearch onPick={usePlaylist} pickedId={pickedId} />

      <div className="divider my-4 text-xs text-base-content/50">
        or paste a URL
      </div>

      <form className="space-y-3" onSubmit={handleAddCourse}>

          {error && (
            <p className="alert alert-error">
              <IoWarning className="inline" />
              {error}
            </p>
          )}
          {success && (
            <p className="alert alert-success">
              <FaCircleCheck className="inline" />
              Course playlist added successfuly!
            </p>
          )}

          <label className="eyebrow">Course Playlist URL</label>
          <input
            type="url"
            className="input w-full"
            name="url"
            required
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://www.youtube.com/playlist?list=PL..."
          />

          <label className="eyebrow mt-2">Language</label>
          <select className="select w-full" name="language" defaultValue="">
            <option value="">Not specified</option>
            {LANGUAGES.map((language) => (
              <option key={language.value} value={language.value}>
                {language.label}
              </option>
            ))}
          </select>

          <button className="btn btn-primary mt-2" disabled={isLoading}>
            <RiPlayListAddFill size={20} />
            {isLoading ? "Adding…" : "Add playlist"}
          </button>
          <div className="alert alert-info alert-soft">
            <FaCircleInfo className="inline-block" /> All the videos from the
            playlist you provide will be automatically fetched and added on the
            background. Course title and other relative data also will be added.
          </div>
      </form>
    </FormPanel>
  );
};

export default AddCourse;
