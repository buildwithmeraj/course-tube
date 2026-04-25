"use client";
import fetchAllVideos from "@/actions/client/fetchAllVideos";
import getPlayListData from "@/actions/client/getPlayListData";
import getPlaylistId from "@/actions/client/getPlaylistId";
import React, { useState } from "react";
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

      const playlistId = getPlaylistId(url);
      if (!playlistId) throw new Error("Invalid playlist URL");

      const infoRes = await getPlayListData(playlistId);
      const infoData = await infoRes.json();

      if (!Array.isArray(infoData.items) || infoData.items.length === 0) {
        throw new Error("Playlist not found");
      }

      const title = infoData.items[0].snippet.title;
      const totalCount = infoData.items[0].contentDetails.itemCount;

      const allVideos = await fetchAllVideos(playlistId);

      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playlistId,
          title,
          totalCount,
          videos: allVideos,
        }),
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
      <div className="card bg-base-200 shadow-xl flex flex-row w-full max-w-md">
        <form className="card-body" onSubmit={handleAddCourse}>
          <h2 className="title-accent text-center">Add Course</h2>

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
