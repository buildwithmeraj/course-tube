"use client";
import NotFound from "@/components/shared/NotFound";
import Loading from "@/components/ui/Loading";
import NotLoggedIn from "@/components/ui/NotLoggedIn";
import VideoCard from "@/components/ui/VideoCard";
import VideoCardSkeleton from "@/components/ui/VideoCardSkeleton";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MdOutlineAddToPhotos } from "react-icons/md";

const CourseDetails = () => {
  const { data: session } = useSession();
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [course, setCourse] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchVideosAndProgress = async () => {
      try {
        setLoading(true);
        const [videosRes, courseRes, progressRes] = await Promise.all([
          fetch(`/api/courses/${id}/videos`),
          fetch(`/api/courses/${id}`),
          fetch(`/api/courses/${id}/progress`),
        ]);

        if (!videosRes.ok || !courseRes.ok) {
          setError("Failed to fetch course data");
          return;
        }

        const [videosData, courseData] = await Promise.all([
          videosRes.json(),
          courseRes.json(),
        ]);
        const progressData = progressRes.ok ? await progressRes.json() : null;

        setVideos(Array.isArray(videosData) ? videosData : []);
        setCourse(courseData);

        const lastFinishedVideo = progressData?.finishedVideo || null;
        const nextVideoId = Array.isArray(videosData)
          ? getNextVideoId(videosData, lastFinishedVideo)
          : null;

        setSelectedVideo(nextVideoId);
      } catch (err) {
        console.error(err);
        setError("Failed to load course details");
      } finally {
        setLoading(false);
      }
    };

    fetchVideosAndProgress();
  }, [id]);

  useEffect(() => {
    const fetchEnrollment = async () => {
      try {
        setEnrollLoading(true);
        const enrollData = await fetch(`/api/courses/${id}/enroll`);

        if (!enrollData.ok) {
          setEnrolled(false);
          return;
        }

        const enrollDataJson = await enrollData.json();
        if (enrollDataJson) {
          setEnrolled(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
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

  const selectedVideoPosition =
    videos.find((video) => video?._id === selectedVideo)?.position ?? -1;

  const getNextVideoId = (videoList, lastFinishedVideo) => {
    if (!Array.isArray(videoList) || videoList.length === 0) {
      return null;
    }

    if (!lastFinishedVideo) {
      return videoList[0]?._id ?? null;
    }

    const lastIndex = videoList.findIndex((v) => v._id === lastFinishedVideo);

    if (lastIndex !== -1 && lastIndex + 1 < videoList.length) {
      return videoList[lastIndex + 1]._id;
    }

    return videoList[lastIndex]?._id ?? videoList[0]?._id ?? null;
  };

  const closeModal = () => {
    setShowModal(false);
  };

  if (error) {
    return <NotFound />;
  }

  if (enrollLoading) return <Loading />;

  if (!session) {
    return <NotLoggedIn />;
  }

  if (!loading && videos.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="card bg-base-200 max-w-lg shadow-md text-center p-8 space-y-3">
          <h2 className="title-accent">No videos yet</h2>
          <p className="text-base-content/70">
            This course does not have any published videos right now. Please
            check back later or return to the courses list.
          </p>
          <div className="pt-2">
            <Link className="btn btn-primary" href="/courses">
              Back to Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
        <h2 className="title-accent flex flex-col lg:flex-row justify-between items-center">
          <span>
            {course?.title} ({videos?.length} Videos)
          </span>
        {!enrolled && (
          <button className="btn btn-primary" onClick={enrollInCourse}>
            <MdOutlineAddToPhotos />
            Enroll Now
          </button>
        )}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading && (
          <>
            {Array.from({ length: 12 }).map((_, i) => (
              <VideoCardSkeleton key={i} />
            ))}
          </>
        )}
        {!loading &&
          videos.map((video) => (
            <VideoCard
              key={video._id.toString()}
              video={video}
              course={course}
              isSelected={video._id === selectedVideo}
              isWatched={
                selectedVideoPosition !== -1 &&
                video.position < selectedVideoPosition
              }
              isEnrolled={enrolled}
              onSelect={(vid) => setSelectedVideo(vid)}
            />
          ))}
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

export default CourseDetails;
