import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API;

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
  const res = await fetch(url);
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      data?.error?.message || data?.message || fallbackMessage || "YouTube API request failed";
    throw new Error(message);
  }

  return data;
};

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

    const data = await fetchYouTubeJson(
      buildYouTubeUrl("https://www.googleapis.com/youtube/v3/videos", {
        part: "contentDetails",
        id: chunk.join(","),
        key: API_KEY,
      }),
      "Failed to fetch video durations from YouTube",
    );

    if (!Array.isArray(data?.items)) {
      throw new Error("Failed to fetch video durations from YouTube");
    }

    data.items.forEach((item) => {
      map[item.id] = item.contentDetails.duration;
    });
  }
  return map;
};

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("courses");
    const coursesCol = db.collection("courses");
    const videosCol = db.collection("videos");

    // Find the course
    const course = await coursesCol.findOne({
      _id: new ObjectId(id),
    });

    // Check if course exists
    if (!course) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 },
      );
    }

    // Check if course was updated in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const lastUpdate = course.updatedAt || course.createdAt;

    if (lastUpdate && new Date(lastUpdate) > sevenDaysAgo) {
      const daysSinceUpdate = Math.ceil(
        (new Date() - new Date(lastUpdate)) / (1000 * 60 * 60 * 24),
      );

      return NextResponse.json(
        {
          message: `Course was last updated ${daysSinceUpdate} day(s) ago. Please wait ${
            7 - daysSinceUpdate
          } more day(s) before updating again.`,
        },
        { status: 429 },
      );
    }

    if (!API_KEY) {
      return NextResponse.json(
        { message: "YouTube API key is missing" },
        { status: 500 },
      );
    }

    // Fetch playlist data from YouTube
    const playlistData = await fetchYouTubeJson(
      buildYouTubeUrl("https://www.googleapis.com/youtube/v3/playlists", {
        part: "snippet,contentDetails",
        id: course.playlistId,
        key: API_KEY,
      }),
      "Failed to fetch playlist data from YouTube",
    );

    if (!playlistData.items || playlistData.items.length === 0) {
      return NextResponse.json(
        { message: "Playlist not found on YouTube" },
        { status: 404 },
      );
    }

    const playlistInfo = playlistData.items[0];
    const title = playlistInfo.snippet.title;
    const totalCount = playlistInfo.contentDetails.itemCount;

    // Fetch all videos from the playlist
    let videos = [];
    let nextPageToken = "";

    do {
      const videoData = await fetchYouTubeJson(
        buildYouTubeUrl("https://www.googleapis.com/youtube/v3/playlistItems", {
          part: "snippet",
          maxResults: "50",
          playlistId: course.playlistId,
          pageToken: nextPageToken,
          key: API_KEY,
        }),
        "Failed to fetch videos from YouTube",
      );

      if (!Array.isArray(videoData?.items)) {
        throw new Error("Failed to fetch videos from YouTube");
      }

      videos.push(
        ...videoData.items.map((item) => ({
          videoId: item.snippet.resourceId.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails?.medium?.url,
          position: item.snippet.position,
          publishedAt: item.snippet.publishedAt,
        })),
      );

      nextPageToken = videoData.nextPageToken || "";
    } while (nextPageToken);

    if (!videos || videos.length === 0) {
      return NextResponse.json(
        { message: "No videos found in the playlist" },
        { status: 404 },
      );
    }

    if (videos.length > 200) {
      return NextResponse.json(
        { message: "Course exceeds maximum video limit of 200" },
        { status: 400 },
      );
    }

    // Fetch durations for all videos
    const videoIds = videos.map((v) => v.videoId);
    const durationMap = await fetchDurations(videoIds);

    // Merge duration data
    videos = videos.map((v) => {
      const parsed = parseDuration(durationMap[v.videoId] || "PT0S");
      return {
        ...v,
        duration: parsed.formatted,
      };
    });

    // Get thumbnail from first video
    const thumbnailUrl = videos[0]?.thumbnail || course.thumbnailUrl || "";

    // Update course information
    const courseUpdateResult = await coursesCol.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          title,
          totalCount,
          thumbnailUrl,
          updatedAt: new Date(),
        },
      },
    );

    if (courseUpdateResult.matchedCount === 0) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 },
      );
    }

    // Delete existing videos for this course
    await videosCol.deleteMany({ courseId: new ObjectId(id) });

    // Insert updated videos
    await videosCol.insertMany(
      videos.map((v, index) => ({
        ...v,
        courseId: new ObjectId(id),
        order: index,
      })),
      { ordered: false },
    );

    console.log(`Updated course ${id} with ${videos.length} videos`);

    return NextResponse.json(
      {
        message: "Course and videos updated successfully",
        courseId: id,
        title,
        totalCount,
        videosUpdated: videos.length,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Error updating course:", err);
    return NextResponse.json(
      { message: "Internal server error", error: err.message },
      { status: 500 },
    );
  }
}
