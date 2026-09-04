"use client";
import NotFound from "@/components/shared/NotFound";
import Loading from "@/components/ui/Loading";
import NotLoggedIn from "@/components/ui/NotLoggedIn";
import VideoListCard from "@/components/ui/VideoListCard";
import VideoListCardSkeleton from "@/components/ui/VideoListCardSkeleton";
import YouTubePlayer from "@/components/ui/YouTubePlayer";
import YouTubePlayerSkeleton from "@/components/ui/YouTubePlayerSkeleton";
import { useSession } from "next-auth/react";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  FaArrowAltCircleLeft,
  FaArrowAltCircleRight,
  FaSyncAlt,
} from "react-icons/fa";
import { RiGraduationCapFill, RiPlayListAddFill } from "react-icons/ri";
import { IoHelpCircle } from "react-icons/io5";
import VideoDescription from "@/components/ui/VideoDescription";
import { formatDuration } from "@/lib/duration";
import ChapterList from "@/components/ui/ChapterList";
import VideoNotes from "@/components/ui/VideoNotes";

const CourseVideos = () => {
  const { data: session } = useSession();
  const [videos, setVideos] = useState([]);
  const [course, setCourse] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [progress, setProgress] = useState({ videos: {}, lastVideoId: null });
  const lastReportedRef = useRef({ videoId: null, seconds: -1 });
  const [manuallySelectedVideo, setManuallySelectedVideo] = useState(null);
  const [descriptionsById, setDescriptionsById] = useState({});
  const [seekRequest, setSeekRequest] = useState(null);
  const [playheadSeconds, setPlayheadSeconds] = useState(0);
  const [lastActiveAt, setLastActiveAt] = useState(null);
  const [notes, setNotes] = useState([]);
  const playerApiRef = useRef(null);
  const requestedDescriptionsRef = useRef(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [synchronizing, setSynchronizing] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(true);
  const { id } = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const progressColor = (total, progress) => {
    let progressPercentage = (progress / total) * 100;
    return progressPercentage < 35
      ? "text-base-content"
      : progressPercentage < 70
        ? "text-warning"
        : "text-success";
  };

  const isUpdatedWithinDays = (dateValue, days = 7) => {
    if (!dateValue) return false;

    const lastUpdate = new Date(dateValue);
    if (Number.isNaN(lastUpdate.getTime())) return false;

    const maxAgeMs = days * 24 * 60 * 60 * 1000;
    return new Date().getTime() - lastUpdate.getTime() < maxAgeMs;
  };

  const fetchVideosAndProgress = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);

      const [resCourse, resVideos, resProgress] = await Promise.all([
        fetch(`/api/courses/${id}`),
        fetch(`/api/courses/${id}/videos`),
        fetch(`/api/courses/${id}/progress`),
      ]);

      if (!resCourse.ok || !resVideos.ok) {
        setError("Failed to fetch course data");
        return;
      }

      const [courseData, videosData] = await Promise.all([
        resCourse.json(),
        resVideos.json(),
      ]);
      const progressData = resProgress.ok ? await resProgress.json() : null;

      setCourse(courseData);
      setUpdated(
        isUpdatedWithinDays(courseData?.updatedAt || courseData?.createdAt, 7),
      );
      setVideos(Array.isArray(videosData) ? videosData : []);
      setLastActiveAt(progressData?.lastActiveAt ?? null);
      setProgress(
        progressData && typeof progressData === "object"
          ? { videos: progressData.videos || {}, lastVideoId: progressData.lastVideoId ?? null }
          : { videos: {}, lastVideoId: null },
      );
    } catch (err) {
      console.error(err);
      setError("Failed to load course data");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;

    fetchVideosAndProgress();
  }, [id, fetchVideosAndProgress]);

  // Derive the selected video instead of setting it in an effect
  const selectedVideo = useMemo(() => {
    if (videos.length === 0) return null;

    // 1) Manual selection (highest priority)
    if (
      manuallySelectedVideo &&
      videos.some((v) => v._id === manuallySelectedVideo)
    ) {
      return manuallySelectedVideo;
    }

    // 2) From URL (if valid)
    const videoIdFromUrl = searchParams.get("video");
    if (videoIdFromUrl && videos.some((v) => v._id === videoIdFromUrl)) {
      return videoIdFromUrl;
    }

    // 3) Resume the most recently watched video if it is unfinished
    const last = progress.lastVideoId;
    if (last) {
      const lastVideo = videos.find((v) => v._id === last);
      if (lastVideo) {
        if (!progress.videos?.[last]?.completedAt) return last;
        const lastIndex = videos.indexOf(lastVideo);
        if (videos[lastIndex + 1]) return videos[lastIndex + 1]._id;
      }
    }

    // 4) Otherwise the first video that is not finished
    const firstUnfinished = videos.find(
      (v) => !progress.videos?.[v._id]?.completedAt,
    );

    return (firstUnfinished || videos[0])._id;
  }, [videos, manuallySelectedVideo, searchParams, progress]);

  const selectedVideoData = useMemo(() => {
    return videos.find((v) => v._id === selectedVideo) || null;
  }, [videos, selectedVideo]);

  const isCompleted = useCallback(
    (videoId) => Boolean(progress.videos?.[videoId]?.completedAt),
    [progress],
  );

  const watchable = useMemo(
    () => videos.filter((video) => !video.unavailable),
    [videos],
  );

  const completedCount = useMemo(
    () => watchable.filter((v) => isCompleted(v._id)).length,
    [watchable, isCompleted],
  );

  // Videos that arrived since this learner last watched anything here
  const newVideos = useMemo(() => {
    if (!lastActiveAt) return [];
    const since = new Date(lastActiveAt).getTime();
    return videos.filter(
      (video) => video.addedAt && new Date(video.addedAt).getTime() > since,
    );
  }, [videos, lastActiveAt]);

  // Hours are what learners actually plan around, so show time as well as count
  const runtime = useMemo(() => {
    let total = 0;
    let remaining = 0;
    let unknown = 0;

    for (const video of watchable) {
      const seconds = Number(video.durationSeconds) || 0;
      if (seconds === 0) unknown += 1;
      total += seconds;
      if (!isCompleted(video._id)) remaining += seconds;
    }

    return { total, remaining, unknown };
  }, [watchable, isCompleted]);

  // Resume where this video was left off, unless it is already finished
  const resumeSeconds = useMemo(() => {
    if (!selectedVideo) return 0;
    const record = progress.videos?.[selectedVideo];
    if (!record || record.completedAt) return 0;
    return record.positionSeconds || 0;
  }, [progress, selectedVideo]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    fetch(`/api/courses/${id}/notes`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled) setNotes(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setNotes([]);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const notesForSelected = useMemo(
    () => notes.filter((note) => note.videoId === selectedVideo),
    [notes, selectedVideo],
  );

  const addNote = useCallback(
    async (text) => {
      if (!selectedVideo) return false;

      // Read the exact play head rather than the last 5-second tick
      const seconds = playerApiRef.current?.getCurrentTime?.() ?? 0;

      try {
        const res = await fetch(`/api/courses/${id}/notes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoId: selectedVideo, seconds, text }),
        });
        if (!res.ok) return false;

        const saved = await res.json();
        setNotes((prev) =>
          [...prev, { ...saved, videoId: selectedVideo }].sort(
            (a, b) => a.seconds - b.seconds,
          ),
        );
        return true;
      } catch {
        return false;
      }
    },
    [id, selectedVideo],
  );

  const deleteNote = useCallback(async (noteId) => {
    try {
      const res = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
      if (!res.ok) return;
      setNotes((prev) => prev.filter((note) => note._id !== noteId));
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  }, []);

  // Descriptions are excluded from the video listing and fetched per video
  useEffect(() => {
    if (!id || !selectedVideo) return;
    if (requestedDescriptionsRef.current.has(selectedVideo)) return;

    requestedDescriptionsRef.current.add(selectedVideo);
    let cancelled = false;

    const store = (text) => {
      if (!cancelled) {
        setDescriptionsById((prev) => ({ ...prev, [selectedVideo]: text }));
      }
    };

    fetch(`/api/courses/${id}/videos/${selectedVideo}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => store(data?.description ?? ""))
      .catch(() => {
        requestedDescriptionsRef.current.delete(selectedVideo);
        store("");
      });

    return () => {
      cancelled = true;
    };
  }, [id, selectedVideo]);

  const updateVideoParam = (videoId) => {
    const params = new URLSearchParams(searchParams);
    params.set("video", videoId);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const saveProgress = useCallback(
    async (video, positionSeconds, { completed = false } = {}) => {
      if (!video?._id) return;

      try {
        const res = await fetch(
          `/api/courses/${id}/progress?videoId=${video._id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ positionSeconds, completed }),
          },
        );
        if (!res.ok) return;

        const data = await res.json().catch(() => ({}));
        setProgress((prev) => ({
          lastVideoId: video._id,
          videos: {
            ...prev.videos,
            [video._id]: {
              completedAt: data.completed
                ? prev.videos?.[video._id]?.completedAt || new Date().toISOString()
                : (prev.videos?.[video._id]?.completedAt ?? null),
              positionSeconds,
            },
          },
        }));
      } catch (err) {
        console.error("Error saving progress:", err);
      }
    },
    [id],
  );

  // The player ticks every 5s; only persist meaningful movement
  const handleProgress = useCallback(
    (seconds, _duration, video) => {
      if (!video?._id || !Number.isFinite(seconds)) return;

      // Pin the video being watched: without this it would be deselected the
      // moment it crosses the completion threshold, mid-playback.
      setManuallySelectedVideo(video._id);

      setPlayheadSeconds(seconds);

      const last = lastReportedRef.current;
      if (last.videoId === video._id && Math.abs(seconds - last.seconds) < 10) {
        return;
      }

      lastReportedRef.current = { videoId: video._id, seconds };
      saveProgress(video, seconds);
    },
    [saveProgress],
  );

  const handleVideoEnd = (video) => {
    saveProgress(video, 0, { completed: true });

    const currentIndex = videos.findIndex((v) => v._id === video._id);
    const nextVideoId =
      currentIndex !== -1 && currentIndex + 1 < videos.length
        ? videos[currentIndex + 1]._id
        : video._id;

    setManuallySelectedVideo(nextVideoId);
    updateVideoParam(nextVideoId);
    toast.success(
      currentIndex + 1 < videos.length
        ? "Video changed to next one"
        : "Course completed",
    );
  };

  const changeVideo = (action) => {
    const currentIndex = videos.findIndex((v) => v._id === selectedVideo);

    if (currentIndex === -1) return;

    if (action === "next" && currentIndex + 1 < videos.length) {
      setManuallySelectedVideo(videos[currentIndex + 1]._id);
    }

    if (action === "prev" && currentIndex > 0) {
      setManuallySelectedVideo(videos[currentIndex - 1]._id);
    }
  };

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

  useEffect(() => {
    const videoFromUrl = searchParams.get("video");
    if (videoFromUrl) {
      setManuallySelectedVideo(null);
    }
  }, [searchParams]);

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

  const handleSynchronize = async () => {
    try {
      setSynchronizing(true);
      const res = await fetch(`/api/courses/${id}/synchronize`, {
        method: "PATCH",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        // Refetch videos after synchronization
        await fetchVideosAndProgress();
        setUpdated(true);

        // Say what actually changed, so syncing reads as useful rather than a chore
        const changes = [];
        if (data.added > 0) changes.push(`${data.added} added`);
        if (data.removed > 0) changes.push(`${data.removed} removed`);
        toast.success(
          changes.length
            ? `Course synchronized — ${changes.join(", ")}`
            : "Course synchronized — no changes",
        );
      } else {
        if (res.status === 429) {
          toast.success(data.message || "Course is already updated");
        } else {
          toast.error(data.message || "Failed to synchronize course");
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
      <div className="flex items-center justify-center h-[80vh]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center flex-col">
          <RiGraduationCapFill size={128} className="text-base-content/50" />
          <h2 className="title-accent text-2xl mb-4 text-center">
            You are not enrolled in this course.
          </h2>
          <button className="btn btn-primary" onClick={enrollInCourse}>
            <RiPlayListAddFill />
            Enroll Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-7 xl:grid-cols-3 gap-4 w-full">
        <div className="col-span-full -mb-2">
          <h2 className="title-accent">{course?.title}</h2>
          {newVideos.length > 0 && (
            <div className="alert alert-info alert-soft mt-2 py-2">
              <FaSyncAlt className="inline" />
              <span>
                {newVideos.length} new video
                {newVideos.length === 1 ? "" : "s"} added since you last watched
                this course.
              </span>
            </div>
          )}
        </div>
        <div className="col-span-full lg:col-span-4 xl:col-span-2 space-y-3 w-full">
          {loading ? (
            <YouTubePlayerSkeleton />
          ) : (
            <YouTubePlayer
              video={selectedVideoData}
              onEnd={handleVideoEnd}
              course={course}
              startSeconds={resumeSeconds}
              onProgress={handleProgress}
              seekRequest={seekRequest}
              ref={playerApiRef}
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
          <ChapterList
            chapters={selectedVideoData?.chapters}
            currentSeconds={playheadSeconds}
            onSeek={(seconds) =>
              setSeekRequest({ seconds, nonce: Date.now() })
            }
          />
          <VideoNotes
            notes={notesForSelected}
            onAdd={addNote}
            onDelete={deleteNote}
            onSeek={(seconds) => setSeekRequest({ seconds, nonce: Date.now() })}
            disabled={!selectedVideo}
          />
          <VideoDescription
            description={descriptionsById[selectedVideo]}
            loading={
              Boolean(selectedVideo) &&
              descriptionsById[selectedVideo] === undefined
            }
          />
          <div className="flex justify-between flex-col md:flex-row items-center">
            <div className="text-lg font-semibold items-center gap-4">
              {runtime.total > 0 && (
                <div className="text-sm font-normal text-base-content/70 mb-1">
                  {runtime.remaining > 0
                    ? `${formatDuration(runtime.remaining)} left of ${formatDuration(runtime.total)}`
                    : `All ${formatDuration(runtime.total)} watched`}
                  {runtime.unknown > 0 &&
                    ` · ${runtime.unknown} video${runtime.unknown === 1 ? "" : "s"} without a duration`}
                </div>
              )}
              Course Progress{" "}
              <progress
                className={`progress w-28 xl:w-56 transition-all duration-300 ${progressColor(
                  watchable.length || course?.totalCount,
                  completedCount,
                )}`}
                value={completedCount}
                max={watchable.length || course?.totalCount}
                id="progress"
              ></progress>
            </div>
            <div>
              <button
                className="btn btn-info btn-sm"
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

        <div className="col-span-full lg:col-span-3 xl:col-span-1 overflow-y-auto max-h-[82vh] space-y-2  scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100  rounded-lg w-full backdrop-blur-lg">
          {loading &&
            Array.from({ length: 12 }).map((_, i) => (
              <VideoListCardSkeleton key={i} />
            ))}
          {videos.map((video) => {
            return (
              <VideoListCard
                key={video._id.toString()}
                video={video}
                course={course}
                isSelected={video._id === selectedVideo}
                isWatched={isCompleted(video._id)}
              />
            );
          })}
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

export default CourseVideos;
