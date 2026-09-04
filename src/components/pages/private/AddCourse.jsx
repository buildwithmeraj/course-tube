"use client";
import React, { useState } from "react";
import { LANGUAGES } from "@/lib/languages";
import { FaCircleCheck, FaCircleInfo } from "react-icons/fa6";
import { IoWarning } from "react-icons/io5";
import { RiPlayListAddFill } from "react-icons/ri";

const AddCourse = () => {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddCourse = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const formData = new FormData(e.currentTarget);
      const url = formData.get("url")?.trim();

      // The server resolves the playlist and fetches its videos from YouTube
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, language: formData.get("language") || null }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }
      setSuccess(true);
      e.target.reset();
    } catch (err) {
      setError(err.message || "Failed to add course");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-[76vh]">
      <div className="card bg-base-200 shadow-md flex flex-row w-full max-w-md">
        <form className="card-body" onSubmit={handleAddCourse}>
          <h1 className="page-title text-accent text-center">Add Course</h1>

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

          <label className="label">Course Playlist URL</label>
          <input
            type="url"
            className="input w-full"
            name="url"
            required
            placeholder="https://www.youtube.com/playlist?list=PL..."
          />

          <label className="label mt-2">Language</label>
          <select className="select w-full" name="language" defaultValue="">
            <option value="">Not specified</option>
            {LANGUAGES.map((language) => (
              <option key={language.value} value={language.value}>
                {language.label}
              </option>
            ))}
          </select>

          <button className="btn btn-accent mt-2" disabled={isLoading}>
            <RiPlayListAddFill size={20} />
            {isLoading ? "Adding..." : "Add Course"}
          </button>
          <div className="alert alert-info alert-soft">
            <FaCircleInfo className="inline-block" /> All the videos from the
            playlist you provide will be automatically fetched and added on the
            background. Course title and other relative data also will be added.
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCourse;
