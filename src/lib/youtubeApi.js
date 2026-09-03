// Server-only: reads YOUTUBE_API_KEY, which must never reach the browser.
import { getServerYouTubeApiKey, getSiteUrl } from "./youtube";

// Maximum number of videos a single course may hold
export const MAX_COURSE_VIDEOS = 200;

// Error carrying the HTTP status a route should answer with
export class YouTubeError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.name = "YouTubeError";
    this.status = status;
  }
}

// Extract a playlist id from a raw id or any YouTube URL
export const parsePlaylistId = (input) => {
  if (!input || typeof input !== "string") return null;

  const value = input.trim();
  if (/^PL[a-zA-Z0-9_-]{16,}$/.test(value)) return value;

  try {
    return new URL(value).searchParams.get("list");
  } catch {
    return null;
  }
};

const buildYouTubeUrl = (baseUrl, params) => {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
};

const fetchYouTubeJson = async (url, fallbackMessage) => {
  const res = await fetch(url, {
    headers: {
      Referer: getSiteUrl(),
      Origin: getSiteUrl(),
    },
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new YouTubeError(
      data?.error?.message || data?.message || fallbackMessage,
    );
  }

  return data;
};

// Read the key at call time so a missing key fails per request, not at import
const requireApiKey = () => {
  const key = getServerYouTubeApiKey();
  if (!key) {
    throw new YouTubeError(
      "Server-side YouTube API key is missing. Set YOUTUBE_API_KEY.",
      500,
    );
  }
  return key;
};

// Convert ISO 8601 duration → seconds + readable string
const parseDuration = (iso) => {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

  const h = Number(match?.[1] || 0);
  const m = Number(match?.[2] || 0);
  const s = Number(match?.[3] || 0);

  return {
    seconds: h * 3600 + m * 60 + s,
    formatted:
      h > 0
        ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
        : `${m}:${String(s).padStart(2, "0")}`,
  };
};

// Fetch durations using videos.list (50 IDs max per request)
const fetchDurations = async (videoIds, apiKey) => {
  const map = {};

  for (let i = 0; i < videoIds.length; i += 50) {
    const chunk = videoIds.slice(i, i + 50);

    const data = await fetchYouTubeJson(
      buildYouTubeUrl("https://www.googleapis.com/youtube/v3/videos", {
        part: "contentDetails",
        id: chunk.join(","),
        key: apiKey,
      }),
      "Failed to fetch video durations from YouTube",
    );

    if (!Array.isArray(data?.items)) {
      throw new YouTubeError("Failed to fetch video durations from YouTube");
    }

    data.items.forEach((item) => {
      map[item.id] = item.contentDetails.duration;
    });
  }

  return map;
};

// Playlist title and video count, straight from YouTube
export const fetchPlaylistInfo = async (playlistId) => {
  const apiKey = requireApiKey();

  const data = await fetchYouTubeJson(
    buildYouTubeUrl("https://www.googleapis.com/youtube/v3/playlists", {
      part: "snippet,contentDetails",
      id: playlistId,
      key: apiKey,
    }),
    "Failed to fetch playlist data from YouTube",
  );

  if (!data.items || data.items.length === 0) {
    throw new YouTubeError("Playlist not found on YouTube", 404);
  }

  return {
    title: data.items[0].snippet.title,
    totalCount: data.items[0].contentDetails.itemCount,
  };
};

// Every video in the playlist, with durations merged in
export const fetchPlaylistVideos = async (playlistId) => {
  const apiKey = requireApiKey();

  let videos = [];
  let nextPageToken = "";

  do {
    const data = await fetchYouTubeJson(
      buildYouTubeUrl("https://www.googleapis.com/youtube/v3/playlistItems", {
        part: "snippet",
        maxResults: "50",
        playlistId,
        pageToken: nextPageToken,
        key: apiKey,
      }),
      "Failed to fetch videos from YouTube",
    );

    if (!Array.isArray(data?.items)) {
      throw new YouTubeError("Failed to fetch videos from YouTube");
    }

    videos.push(
      ...data.items.map((item) => ({
        videoId: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails?.medium?.url || "",
        position: item.snippet.position,
        publishedAt: item.snippet.publishedAt,
      })),
    );

    nextPageToken = data.nextPageToken || "";
  } while (nextPageToken);

  if (videos.length === 0) {
    throw new YouTubeError("No videos found in the playlist", 404);
  }

  if (videos.length > MAX_COURSE_VIDEOS) {
    throw new YouTubeError(
      `Course exceeds maximum video limit of ${MAX_COURSE_VIDEOS}`,
      400,
    );
  }

  const durationMap = await fetchDurations(
    videos.map((v) => v.videoId),
    apiKey,
  );

  return videos.map((v) => {
    const parsed = parseDuration(durationMap[v.videoId] || "PT0S");
    return {
      ...v,
      duration: parsed.formatted,
      durationSeconds: parsed.seconds,
    };
  });
};
