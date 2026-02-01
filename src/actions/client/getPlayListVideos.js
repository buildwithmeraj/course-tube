"use client";
const getPlayListVideos = async (playlistId, nextPageToken) => {
  const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API;
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=50&pageToken=${nextPageToken}&key=${API_KEY}`,
  );

  if (!res.ok) {
    throw new Error("Failed to fetch playlist videos from YouTube");
  }

  return res;
};
export default getPlayListVideos;
