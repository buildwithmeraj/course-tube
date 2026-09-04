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
import Image from "next/image";
import { FaPlay, FaRegClock, FaVideo, FaCheck } from "react-icons/fa6";
import { formatDuration } from "@/lib/duration";
import { languageLabel } from "@/lib/languages";

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
        <div className="max-w-lg space-y-3 rounded-box border border-hairline bg-base-100 p-8 text-center">
          <h1 className="page-title">No videos yet</h1>
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

  const watchable = videos.filter((v) => !v.unavailable);
  const done = watchable.filter((v) => completedIds.has(v._id)).length;
  const total = watchable.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const complete = total > 0 && done >= total;
  const resumeHref = selectedVideo
    ? `/courses/${id}/videos?video=${selectedVideo}`
    : `/courses/${id}/videos`;

  return (
    <div className="space-y-5">
      {/* A course page has to answer "should I start this, and where was I" —
          the lesson grid alone answered neither. */}
      <div className="grid gap-4 rounded-box border border-hairline bg-base-100 p-4 sm:grid-cols-[220px_1fr]">
        <div className="relative aspect-video overflow-hidden rounded-field bg-base-300">
          {course?.thumbnailUrl && (
            <Image
              src={course.thumbnailUrl}
              alt=""
              fill
              sizes="220px"
              className="object-cover"
              priority
            />
          )}
        </div>

        <div className="flex min-w-0 flex-col">
          <h1 className="page-title mb-1">
            {loading ? (
              <span className="loading loading-dots loading-md" />
            ) : (
              course?.title
            )}
          </h1>

          <div className="figure-text flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-base-content/60">
            <span className="flex items-center gap-1">
              <FaVideo size={11} />
              {videos.length} lessons
            </span>
            {course?.totalDurationSeconds > 0 && (
              <span className="flex items-center gap-1">
                <FaRegClock size={11} />
                {formatDuration(course.totalDurationSeconds)}
              </span>
            )}
            {languageLabel(course?.language) && (
              <span className="rounded-selector border border-hairline px-1.5">
                {languageLabel(course.language)}
              </span>
            )}
            {course?.enrollCount >= 0 && (
              <span>{course.enrollCount} enrolled</span>
            )}
          </div>

          {enrolled && total > 0 && (
            <div className="mt-4 max-w-sm">
              <div className="figure-text mb-1 flex items-baseline justify-between text-xs">
                <span className={complete ? "text-success" : ""}>
                  {complete ? "Finished" : `${done} of ${total} done`}
                </span>
                <span className="text-base-content/50">{pct}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-base-300">
                <div
                  className={`h-full ${complete ? "bg-success" : "bg-accent"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}

          <div className="mt-auto flex flex-wrap gap-2 pt-4">
            {enrolled ? (
              <Link href={resumeHref} className="btn btn-primary btn-sm">
                <FaPlay size={10} />
                {complete ? "Rewatch" : done > 0 ? "Resume" : "Start course"}
              </Link>
            ) : (
              !enrollLoading && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={enrollInCourse}
                >
                  <MdOutlineAddToPhotos size={14} />
                  Enroll now
                </button>
              )
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="section-title mb-0">Lessons</h2>
          {enrolled && done > 0 && (
            <span className="figure-text text-xs text-base-content/60">
              <FaCheck size={9} className="mr-1 inline text-success" />
              {done} watched
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5">
          {loading &&
            Array.from({ length: 10 }).map((_, i) => (
              <VideoCardSkeleton key={i} />
            ))}
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
                <button className="btn btn-primary" onClick={closeModal}>
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
