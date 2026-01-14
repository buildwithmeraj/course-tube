"use client";
const getPlayListData = async (playlistId) => {
  const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API;
  return fetch(
    `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&id=${playlistId}&key=${API_KEY}`
  );
};
export default getPlayListData;
