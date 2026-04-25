"use client";

import { getPublicYouTubeApiKey } from "@/lib/youtube";

const API_KEY = getPublicYouTubeApiKey();

// Convert ISO 8601 duration → seconds + readable string
const parseDuration = (iso) => {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

  const h = Number(match?.[1] || 0);
  const m = Number(match?.[2] || 0);
  const s = Number(match?.[3] || 0);

  const totalSeconds = h * 3600 + m * 60 + s;

  return {
    seconds: totalSeconds,
    formatted:
      h > 0
        ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
        : `${m}:${String(s).padStart(2, "0")}`,
  };
};

// Fetch durations using videos.list (50 IDs max)
const fetchDurations = async (videoIds) => {
  const map = {};
  for (let i = 0; i < videoIds.length; i += 50) {
    const chunk = videoIds.slice(i, i + 50);

    const url = new URL("https://www.googleapis.com/youtube/v3/videos");
    url.searchParams.set("part", "contentDetails");
    url.searchParams.set("id", chunk.join(","));
    url.searchParams.set("key", API_KEY);

    const res = await fetch(url.toString());
    const data = await res.json().catch(() => null);

    if (!res.ok || !Array.isArray(data?.items)) {
      throw new Error("Failed to fetch video durations from YouTube");
    }

    data.items.forEach((item) => {
      map[item.id] = item.contentDetails.duration;
    });
  }
  return map;
};

const fetchAllVideos = async (playlistId) => {
  if (!API_KEY) {
    throw new Error("Public YouTube API key is missing");
  }

  let videos = [];
  let nextPageToken = "";

  do {
    const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("maxResults", "50");
    url.searchParams.set("playlistId", playlistId);
    if (nextPageToken) {
      url.searchParams.set("pageToken", nextPageToken);
    }
    url.searchParams.set("key", API_KEY);

    const res = await fetch(url.toString());
    const data = await res.json().catch(() => null);

    if (!res.ok || !Array.isArray(data?.items)) {
      throw new Error("Failed to fetch videos from YouTube");
    }

    videos.push(
      ...data.items.map((item) => ({
        videoId: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails?.medium?.url,
        position: item.snippet.position,
        publishedAt: item.snippet.publishedAt,
      })),
    );

    nextPageToken = data.nextPageToken || "";
  } while (nextPageToken);

  // Fetch durations
  const ids = videos.map((v) => v.videoId);
  const durationMap = await fetchDurations(ids);

  // Merge duration data
  return videos.map((v) => {
    const iso = durationMap[v.videoId];

    if (!iso) {
      return {
        ...v,
        duration: "0:00",
        durationSeconds: 0,
      };
    }

    const parsed = parseDuration(iso);

    return {
      ...v,
      duration: parsed.formatted,
      durationSeconds: parsed.seconds,
    };
  });
};

export default fetchAllVideos;
