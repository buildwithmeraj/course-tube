"use client";
import Loading from "@/components/ui/Loading";
import VideoCard from "@/components/ui/VideoCard";
import YouTubePlayer from "@/components/ui/YouTubePlayer";
import Icon from "@/components/utilities/Icon";
import { useParams, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

const VideosPage = () => {
  const [videos, setVideos] = useState([]);
  const [course, setCourse] = useState([]);
  const [lastFinishedVideo, setLastFinishedVideo] = useState(null);
  const [manuallySelectedVideo, setManuallySelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!id) return;

    const fetchVideosAndProgress = async () => {
      try {
        // set loading state
        setLoading(true);
        // Fetch all videos for the course
        const resVideos = await fetch(`/api/courses/${id}/videos`);
        const videosData = await resVideos.json();
        setVideos(videosData);

        // Fetch course details
        const resCourse = await fetch(`/api/courses/${id}`);
        const courseData = await resCourse.json();
        setCourse(courseData);

        // Fetch user progress (last finished video)
        const resProgress = await fetch(`/api/courses/${id}/progress`);
        const progressData = await resProgress.json();
        const finishedVideoId = progressData?.finishedVideo || null;
        setLastFinishedVideo(finishedVideoId);
        setLoading(false);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideosAndProgress();
  }, [id]);

  // Derive the selected video instead of setting it in an effect
  const selectedVideo = useMemo(() => {
    if (videos.length === 0) return null;

    //  Manually selected video
    if (
      manuallySelectedVideo &&
      videos.some((v) => v._id === manuallySelectedVideo)
    ) {
      return manuallySelectedVideo;
    }

    // Video from URL
    const videoIdFromUrl = searchParams.get("video");
    if (videoIdFromUrl && videos.some((v) => v._id === videoIdFromUrl)) {
      return videoIdFromUrl;
    }

    // Next video after last finished
    if (lastFinishedVideo) {
      const lastIndex = videos.findIndex((v) => v._id === lastFinishedVideo);
      if (lastIndex !== -1 && lastIndex + 1 < videos.length) {
        return videos[lastIndex + 1]._id;
      }
    }

    // Default to first video
    return videos[0]._id;
  }, [videos, manuallySelectedVideo, searchParams, lastFinishedVideo]);

  const selectedVideoData = useMemo(() => {
    return videos.find((v) => v._id === selectedVideo) || null;
  }, [videos, selectedVideo]);

  const handleVideoEnd = (video) => {
    console.log("User finished video:", video);
    fetch(`/api/courses/${id}/progress?videoId=${video._id}`, {
      method: "PATCH",
    }).catch((err) => console.error("Error marking progress:", err));
  };

  if (loading) {
    <Loading />;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <YouTubePlayer video={selectedVideoData} onEnd={handleVideoEnd} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {videos.map((video) => (
            <VideoCard
              key={video._id.toString()}
              video={video}
              course={course}
              isSelected={video._id === selectedVideo}
              onSelect={(vid) => setManuallySelectedVideo(vid)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideosPage;
