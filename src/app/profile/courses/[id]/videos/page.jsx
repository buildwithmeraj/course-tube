"use client";
import VideoListCard from "@/components/ui/VideoListCard";
import VideoListCardSkeleton from "@/components/ui/VideoListCardSkeleton";
import YouTubePlayer from "@/components/ui/YouTubePlayer";
import YouTubePlayerSkeleton from "@/components/ui/YouTubePlayerSkeleton";
import { useParams, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FaArrowAltCircleLeft, FaArrowAltCircleRight } from "react-icons/fa";

const VideosPage = () => {
  const [videos, setVideos] = useState([]);
  const [course, setCourse] = useState([]);
  const [lastFinishedVideo, setLastFinishedVideo] = useState(null);
  const [manuallySelectedVideo, setManuallySelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const searchParams = useSearchParams();

  const progressColor = (total, progress) => {
    let progressPercentage = (progress / total) * 100;
    return progressPercentage < 35
      ? "text-base-content"
      : progressPercentage < 70
      ? "text-warning"
      : "text-success";
  };

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
    setLastFinishedVideo(video._id);
    fetch(`/api/courses/${id}/progress?videoId=${video._id}`, {
      method: "PATCH",
    }).catch((err) => console.error("Error marking progress:", err));
    changeVideo("next");
    toast.success("Video changed to next one");
  };

  const changeVideo = (action) => {
    if (action === "next") {
      const currentIndex = videos.findIndex((v) => v._id === selectedVideo);
      if (currentIndex !== -1 && currentIndex + 1 < videos.length) {
        setManuallySelectedVideo(videos[currentIndex + 1]._id);
      }
    } else if (action === "prev") {
      const currentIndex = videos.findIndex((v) => v._id === selectedVideo);
      if (currentIndex > 0) {
        setManuallySelectedVideo(videos[currentIndex - 1]._id);
      }
    } else {
      console.warn("Unknown action for changeVideo:", action);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-3">
          {loading ? (
            <YouTubePlayerSkeleton />
          ) : (
            <YouTubePlayer
              video={selectedVideoData}
              onEnd={handleVideoEnd}
              course={course}
            />
          )}
          <div className="flex items-center justify-between">
            <button
              className="btn btn-accent btn-soft"
              onClick={() => changeVideo("prev")}
            >
              <FaArrowAltCircleLeft />
              Previous
            </button>
            <button
              className="btn btn-accent btn-soft"
              onClick={() => changeVideo("next")}
            >
              Next
              <FaArrowAltCircleRight />
            </button>
          </div>
          <div className="text-lg font-semibold flex items-center gap-4">
            Course Progress{" "}
            <progress
              className={`progress w-56 transition-all duration-300 ${progressColor(
                course?.totalCount,
                videos.find((v) => v._id === lastFinishedVideo)?.position + 1 ||
                  0
              )}`}
              value={
                videos.find((v) => v._id === lastFinishedVideo)?.position + 1 ||
                0
              }
              max={course?.totalCount}
              id="progress"
            ></progress>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[85vh] space-y-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          {loading &&
            Array.from({ length: 12 }).map((_, i) => (
              <VideoListCardSkeleton key={i} />
            ))}
          {videos.map((video) => (
            <VideoListCard
              key={video._id.toString()}
              video={video}
              course={course}
              isSelected={video._id === selectedVideo}
              isWatched={
                lastFinishedVideo &&
                video.position <=
                  videos.find((v) => v._id === lastFinishedVideo)?.position
              }
              onSelect={(vid) => setManuallySelectedVideo(vid)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideosPage;
