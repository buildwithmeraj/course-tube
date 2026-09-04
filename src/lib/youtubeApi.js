// Server-only: reads YOUTUBE_API_KEY, which must never reach the browser.
import { getServerYouTubeApiKey, getSiteUrl } from "./youtube";
import { chargeQuota } from "./quota";
import {
  MAX_COURSE_VIDEOS,
  SEARCH_MAX_RESULTS,
  SEARCH_UNIT_COST,
} from "./limits";
import { parseChapters, isUnavailableVideo } from "./chapters";

export { MAX_COURSE_VIDEOS };

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

const fetchYouTubeJson = async (url, fallbackMessage, charge = {}) => {
  // Charged before the request so the breaker cannot be bypassed by a new
  // caller: playlists.list, playlistItems.list and videos.list are 1 unit each,
  // and search.list is 100.
  const { units = 1, bucket = null } = charge;
  const quota = await chargeQuota(units, bucket);
  if (!quota.allowed) {
    throw new YouTubeError(
      quota.stoppedBy === "search"
        ? "Daily YouTube search budget reached. Paste a playlist URL instead — adding still works."
        : "Daily YouTube API budget reached. Adding and syncing courses will resume tomorrow.",
      503,
    );
  }

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

// Search YouTube for playlists. The expensive one: search.list is 100 units
// against 1 for everything else here, so it is charged to its own bucket and
// every caller is expected to cache the result.
//
// search.list does not return item counts, so the ids are passed through
// playlists.list — 1 unit for up to 50 of them — to get something worth showing.
export const searchPlaylists = async (query) => {
  const apiKey = requireApiKey();

  const found = await fetchYouTubeJson(
    buildYouTubeUrl("https://www.googleapis.com/youtube/v3/search", {
      part: "snippet",
      type: "playlist",
      q: query,
      maxResults: String(SEARCH_MAX_RESULTS),
      key: apiKey,
    }),
    "Failed to search YouTube",
    { units: SEARCH_UNIT_COST, bucket: "search" },
  );

  const items = Array.isArray(found?.items) ? found.items : [];
  const ids = items.map((item) => item.id?.playlistId).filter(Boolean);
  if (ids.length === 0) return [];

  const details = await fetchYouTubeJson(
    buildYouTubeUrl("https://www.googleapis.com/youtube/v3/playlists", {
      part: "snippet,contentDetails",
      id: ids.join(","),
      key: apiKey,
    }),
    "Failed to read playlist details from YouTube",
  );

  const countById = Object.fromEntries(
    (details?.items || []).map((item) => [item.id, item.contentDetails?.itemCount ?? 0]),
  );

  return items
    .map((item) => {
      const playlistId = item.id?.playlistId;
      const snippet = item.snippet || {};

      return {
        playlistId,
        title: snippet.title || "Untitled playlist",
        channelTitle: snippet.channelTitle || "",
        thumbnail:
          snippet.thumbnails?.medium?.url ||
          snippet.thumbnails?.default?.url ||
          null,
        totalCount: countById[playlistId] ?? 0,
      };
    })
    // A playlist YouTube will not tell us the size of is one we cannot import
    .filter((item) => item.playlistId && item.totalCount > 0);
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
    const video = {
      ...v,
      duration: parsed.formatted,
      durationSeconds: parsed.seconds,
    };

    return {
      ...video,
      // Deleted and private entries stay in the playlist but can never be
      // watched, so they must not count towards completing the course
      unavailable: isUnavailableVideo(video),
      chapters: parseChapters(video.description, parsed.seconds),
    };
  });
};
