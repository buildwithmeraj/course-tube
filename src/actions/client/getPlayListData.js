"use client";

import { getPublicYouTubeApiKey } from "@/lib/youtube";

const getPlayListData = async (playlistId) => {
  const API_KEY = getPublicYouTubeApiKey();

  if (!API_KEY) {
    throw new Error("Public YouTube API key is missing");
  }

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&id=${playlistId}&key=${API_KEY}`,
  );

  if (!res.ok) {
    throw new Error("Failed to fetch playlist data from YouTube");
  }

  return res;
};

export default getPlayListData;
