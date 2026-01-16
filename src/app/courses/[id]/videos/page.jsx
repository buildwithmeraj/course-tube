"use client";
import Loading from "@/components/ui/Loading";
import VideoListCard from "@/components/ui/VideoListCard";
import VideoListCardSkeleton from "@/components/ui/VideoListCardSkeleton";
import YouTubePlayer from "@/components/ui/YouTubePlayer";
import YouTubePlayerSkeleton from "@/components/ui/YouTubePlayerSkeleton";
import { useParams, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FaArrowAltCircleLeft, FaArrowAltCircleRight } from "react-icons/fa";
import { RiGraduationCapFill } from "react-icons/ri";

const VideosPage = () => {
  const [videos, setVideos] = useState([]);
  const [course, setCourse] = useState([]);
  const [enrolled, setEnrolled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [lastFinishedVideo, setLastFinishedVideo] = useState(null);
  const [manuallySelectedVideo, setManuallySelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(true);
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
        console.log("Last finished video ID:", finishedVideoId);
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

  useEffect(() => {
    const fetchEnrollment = async () => {
      try {
        setEnrollLoading(true);
        const enrollData = await fetch(`/api/courses/${id}/enroll`);
        const enrollDataJson = await enrollData.json();
        if (enrollDataJson) {
          setEnrolled(true);
        }
        setEnrollLoading(false);
      } catch (err) {
        console.error(err);
        setEnrollLoading(false);
      }
    };
    fetchEnrollment();
  }, [id]);

  const enrollInCourse = async () => {
    try {
      setEnrollLoading(true);
      const res = await fetch(`/api/courses/${id}/enroll`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setEnrolled(true);
      }
      toast.success("Enrolled successfully");
      setShowModal(true);
      setEnrollLoading(false);
    } catch (err) {
      console.error(err);
      setEnrollLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  if (enrollLoading) return <Loading />;

  if (!enrolled) {
    return (
      <div className="flex items-center justify-center h-dvh">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center flex-col">
          <RiGraduationCapFill size={128} className="text-base-content/50" />
          <h2 className="text-2xl mb-4">
            You are not enrolled in this course.
          </h2>
          <button className="btn btn-primary" onClick={enrollInCourse}>
            Enroll Now
          </button>
        </div>
      </div>
    );
  }

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
      {showModal && (
        <dialog
          id="enrolled_modal"
          className="modal modal-open modal-bottom sm:modal-middle"
        >
          <div className="modal-box text-success text-center">
            <h2 className="font-bold ">Congratulations!</h2>
            <p className="py-4">
              You have successfully enrolled in the course. Start learning now!
              Good luck!
            </p>
            <div className="modal-action flex items-center justify-center">
              <form method="dialog">
                <button className="btn btn-success" onClick={closeModal}>
                  Okay
                </button>
              </form>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default VideosPage;
