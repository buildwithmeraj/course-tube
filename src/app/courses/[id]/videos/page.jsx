"use client";
import NotFound from "@/components/shared/NotFound";
import Loading from "@/components/ui/Loading";
import NotLoggedIn from "@/components/ui/NotLoggedIn";
import VideoListCard from "@/components/ui/VideoListCard";
import VideoListCardSkeleton from "@/components/ui/VideoListCardSkeleton";
import YouTubePlayer from "@/components/ui/YouTubePlayer";
import YouTubePlayerSkeleton from "@/components/ui/YouTubePlayerSkeleton";
import { useSession } from "next-auth/react";
import { useParams, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  FaArrowAltCircleLeft,
  FaArrowAltCircleRight,
  FaSyncAlt,
} from "react-icons/fa";
import { RiGraduationCapFill } from "react-icons/ri";
import { IoHelpCircle } from "react-icons/io5";
import VideoDescription from "@/components/ui/VideoDescription";

const VideosPage = () => {
  const { data: session, status } = useSession();
  const [videos, setVideos] = useState([]);
  const [course, setCourse] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [updated, setUpdated] = useState(true);
  const [lastFinishedVideo, setLastFinishedVideo] = useState(null);
  const [manuallySelectedVideo, setManuallySelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [synchronizing, setSynchronizing] = useState(false);
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
      // Check if course was updated in the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      try {
        // set loading state
        setLoading(true);
        // Fetch course details
        const resCourse = await fetch(`/api/courses/${id}`);
        if (!resCourse.ok) {
          setError("Failed to fetch course details");
        }
        const courseData = await resCourse.json();
        setCourse(courseData);
        if (courseData.updatedAt > sevenDaysAgo) {
          setUpdated(true);
        }

        // Fetch all videos for the course
        const resVideos = await fetch(`/api/courses/${id}/videos`);
        if (!resVideos.ok) {
          setError("Failed to fetch videos");
        }
        const videosData = await resVideos.json();
        setVideos(videosData);

        // Fetch user progress (last finished video)
        const resProgress = await fetch(`/api/courses/${id}/progress`);
        const progressData = await resProgress.json();
        const finishedVideoId = progressData?.finishedVideo || null;
        setLastFinishedVideo(finishedVideoId);
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

  const handleSynchronize = async () => {
    try {
      setSynchronizing(true);
      const res = await fetch(`/api/courses/${id}/synchronize`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (res.ok) {
        // Refetch videos after synchronization
        fetchVideosAndProgress();
        toast.success("Course synchronized successfully");
      } else {
        if (res.status === 429) {
          toast.success("Course is already updated");
        } else {
          toast.error("Failed to synchronize course");
        }
      }
      setSynchronizing(false);
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during synchronization");
      setSynchronizing(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  if (error) {
    return <NotFound />;
  }

  if (!session && !loading) {
    return <NotLoggedIn />;
  }

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
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-full -mb-2">
          <h2>{course.title}</h2>
        </div>
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
              className="btn btn-soft"
              onClick={() => changeVideo("prev")}
            >
              <FaArrowAltCircleLeft />
              Previous
            </button>
            <button
              className="btn btn-soft"
              onClick={() => changeVideo("next")}
            >
              Next
              <FaArrowAltCircleRight />
            </button>
          </div>
          <VideoDescription description={selectedVideoData?.description} />
          <div className="flex justify-between items-center">
            <div className="text-lg font-semibold flex items-center gap-4">
              Course Progress{" "}
              <progress
                className={`progress w-56 transition-all duration-300 ${progressColor(
                  course?.totalCount,
                  videos.find((v) => v._id === lastFinishedVideo)?.position +
                    1 || 0,
                )}`}
                value={
                  videos.find((v) => v._id === lastFinishedVideo)?.position +
                    1 || 0
                }
                max={course?.totalCount}
                id="progress"
              ></progress>
            </div>
            <div>
              <button
                className="btn btn-info btn-soft btn-sm"
                onClick={handleSynchronize}
                disabled={synchronizing || updated}
              >
                {synchronizing ? (
                  <>
                    <FaSyncAlt className="animate-spin" /> Synchronizing ...
                  </>
                ) : (
                  <>
                    <FaSyncAlt /> Sync Course
                  </>
                )}{" "}
              </button>
              <div
                className="tooltip tooltip-top"
                data-tip={
                  updated
                    ? `Already synchronized within last 7 days`
                    : `Get latest videos YouTube`
                }
              >
                <button
                  className="btn btn-circle btn-soft ml-2 btn-sm"
                  type="button"
                >
                  <IoHelpCircle />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[76vh] space-y-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 rounded-lg">
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
