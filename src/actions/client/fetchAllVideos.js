"use client";

const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API;

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

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${chunk.join(
        ","
      )}&key=${API_KEY}`
    );

    const data = await res.json();

    data.items.forEach((item) => {
      map[item.id] = item.contentDetails.duration;
    });
  }
  return map;
};

const fetchAllVideos = async (playlistId) => {
  let videos = [];
  let nextPageToken = "";

  do {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&pageToken=${nextPageToken}&key=${API_KEY}`
    );

    const data = await res.json();

    videos.push(
      ...data.items.map((item) => ({
        videoId: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails?.medium?.url,
        position: item.snippet.position,
        publishedAt: item.snippet.publishedAt,
      }))
    );

    nextPageToken = data.nextPageToken || "";
  } while (nextPageToken);

  // Fetch durations
  const ids = videos.map((v) => v.videoId);
  const durationMap = await fetchDurations(ids);

  // Merge duration data
  return videos.map((v) => {
    const parsed = parseDuration(durationMap[v.videoId] || "PT0S");
    return {
      ...v,
      duration: parsed.formatted,
      durationSeconds: parsed.seconds,
    };
  });
};

export default fetchAllVideos;
