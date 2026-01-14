"use client";
const getPlayListVideos = async (playlistId, nextPageToken) => {
  const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API;
  return await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=50&pageToken=${nextPageToken}&key=${API_KEY}`
  );
};
export default getPlayListVideos;
