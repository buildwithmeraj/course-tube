"use client";
import fetchAllVideos from "@/actions/client/fetchAllVideos";
import getPlayListData from "@/actions/client/getPlayListData";
import getPlaylistId from "@/actions/client/getPlaylistId";
import React, { useState } from "react";
import { BiSolidVideos } from "react-icons/bi";
import { RiPlayListAddFill } from "react-icons/ri";

const AddCourse = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddCourse = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const url = formData.get("url");

      const playlistId = getPlaylistId(url);
      if (!playlistId) throw new Error("Invalid playlist URL");

      const infoRes = await getPlayListData(playlistId);
      const infoData = await infoRes.json();

      if (!infoData.items?.length) {
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

      alert("Course added successfully!");
      e.target.reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-[85vh]">
      <div className="card bg-base-100 shadow-xl flex flex-row">
        <div
          className={`hidden md:flex ${
            error ? "text-error" : "text-accent"
          } pl-2`}
        >
          <BiSolidVideos size={200} />
        </div>

        <form className="card-body" onSubmit={handleAddCourse}>
          <h2 className="text-center">Add Course</h2>

          {error && <p className="text-error">{error}</p>}

          <label className="label">Course Playlist URL</label>
          <input
            type="url"
            className="input"
            name="url"
            required
            placeholder="https://www.youtube.com/playlist?list=PL..."
          />

          <button className="btn btn-accent mt-2" disabled={isLoading}>
            <RiPlayListAddFill size={20} />
            {isLoading ? "Adding..." : "Add Course"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCourse;
