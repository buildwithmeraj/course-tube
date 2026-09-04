"use client";
import NotFound from "@/components/shared/NotFound";
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
  const { data: session, status } = useSession();
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [completedIds, setCompletedIds] = useState(() => new Set());
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

        const completed = new Set(
          Object.entries(progressData?.videos || {})
            .filter(([, record]) => record?.completedAt)
            .map(([videoId]) => videoId),
        );

        setCompletedIds(completed);
        setSelectedVideo(
          Array.isArray(videosData)
            ? getNextVideoId(videosData, completed, progressData?.lastVideoId)
            : null,
        );
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
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.message || "Failed to enrol in this course");
        setEnrollLoading(false);
        return;
      }
      setEnrolled(true);
      toast.success("Enrolled successfully");
      setShowModal(true);
      setEnrollLoading(false);
    } catch (err) {
      console.error(err);
      setEnrollLoading(false);
    }
  };

  // Resume the last video touched if unfinished, else the first unfinished one
  const getNextVideoId = (videoList, completed, lastVideoId) => {
    if (!Array.isArray(videoList) || videoList.length === 0) {
      return null;
    }

    if (lastVideoId && !completed.has(lastVideoId)) {
      const stillExists = videoList.some((v) => v._id === lastVideoId);
      if (stillExists) return lastVideoId;
    }

    const firstUnfinished = videoList.find((v) => !completed.has(v._id));
    return (firstUnfinished || videoList[0])._id;
  };

  const closeModal = () => {
    setShowModal(false);
  };

  if (error) {
    return <NotFound />;
  }

  if (status === "unauthenticated") {
    return <NotLoggedIn />;
  }

  if (!loading && videos.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="card bg-base-200 max-w-lg shadow-md text-center p-8 space-y-3">
          <h1 className="page-title text-accent">No videos yet</h1>
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
      <h1 className="page-title text-accent flex flex-col lg:flex-row justify-between items-center">
        <span>
          {loading ? (
            <span className="loading loading-dots loading-xl"></span>
          ) : (
            <>
              {course?.title} ({videos?.length} Videos)
            </>
          )}
        </span>
        {!enrollLoading && !enrolled && (
          <button className="btn btn-primary" onClick={enrollInCourse}>
            <MdOutlineAddToPhotos />
            Enroll Now
          </button>
        )}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
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
              isWatched={completedIds.has(video._id)}
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
            <h3 className="subsection-title">Congratulations!</h3>
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
