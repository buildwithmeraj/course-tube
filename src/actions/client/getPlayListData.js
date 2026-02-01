"use client";

const getPlayListData = async (playlistId) => {
  const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API;

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&id=${playlistId}&key=${API_KEY}`,
  );

  if (!res.ok) {
    throw new Error("Failed to fetch playlist data from YouTube");
  }

  return res;
};

export default getPlayListData;
