"use client";
import getPlayListData from "@/actions/client/getPlayListData";
import getPlaylistId from "@/actions/client/getPlaylistId";
import getPlayListVideos from "@/actions/client/getPlayListVideos";
import VideoCard from "@/components/ui/VideoCard";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const Test = () => {
  const [playlistInfo, setPlaylistInfo] = useState(null);
  const [allVideos, setAllVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API;

  useEffect(() => {
    if (!id) return;
    let ignore = false;

    const fetchData = async () => {
      const playlistId = getPlaylistId(id);
      if (!playlistId) {
        setError("Invalid playlist ID");
        setLoading(false);
        return;
      }

      try {
        // get playlist info
        const infoRes = await getPlayListData(playlistId);
        if (!infoRes.ok) {
          const text = await infoRes.text();
          console.error("API Error Response:", text);
          throw new Error(`API Error: ${infoRes.status}`);
        }

        const infoData = await infoRes.json();

        if (!ignore && infoData.items?.length > 0) {
          setPlaylistInfo({
            title: infoData.items[0].snippet.title,
            totalCount: infoData.items[0].contentDetails.itemCount,
          });
        }

        // get all videos
        let videos = [];
        let nextPageToken = "";

        do {
          const videoRes = await getPlayListVideos(playlistId, nextPageToken);

          if (!videoRes.ok) {
            const text = await videoRes.text();
            console.error("API Error Response:", text);
            throw new Error(`API Error: ${videoRes.status}`);
          }

          const videoData = await videoRes.json();

          if (videoData.items) {
            videos = [...videos, ...videoData.items];
          }
          nextPageToken = videoData.nextPageToken || "";
        } while (nextPageToken && !ignore);

        if (!ignore) {
          setAllVideos(videos);
          setLoading(false);
        }
      } catch (error) {
        console.error("Fetch Error:", error);
        if (!ignore) {
          setError(error.message);
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      ignore = true;
    };
  }, [id, API_KEY]);

  if (loading) return <p>Loading playlist...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Playlist: {playlistInfo?.title}</h1>
      <p>Total Videos (API count): {playlistInfo?.totalCount}</p>
      <p>Videos Fetched: {allVideos.length}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        {allVideos.map((vid) => (
          <VideoCard key={vid.snippet.resourceId.videoId} video={vid} />
        ))}
      </div>
    </div>
  );
};

export default Test;
