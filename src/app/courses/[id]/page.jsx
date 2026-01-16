"use client";
import Loading from "@/components/ui/Loading";
import VideoCard from "@/components/ui/VideoCard";
import VideoCardSkeleton from "@/components/ui/VideoCardSkeleton";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { RiGraduationCapFill } from "react-icons/ri";

const CourseDetails = () => {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [course, setCourse] = useState([]);
  const [enrolled, setEnrolled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchVideosAndProgress = async () => {
      try {
        // set loading state
        setLoading(true);
        // Fetch all videos for the course
        const videosRes = await fetch(`/api/courses/${id}/videos`);
        const videosData = await videosRes.json();
        setVideos(videosData);

        // Fetch course details
        const resCourse = await fetch(`/api/courses/${id}`);
        const courseData = await resCourse.json();
        setCourse(courseData);

        // Fetch user progress (single finished video)
        const progressRes = await fetch(`/api/courses/${id}/progress`);
        const progressData = await progressRes.json();

        const lastFinishedVideo = progressData?.finishedVideo || null;

        // Determine next video to highlight
        let nextVideoId = videosData[0]?._id; // default first video

        if (lastFinishedVideo) {
          const lastIndex = videosData.findIndex(
            (v) => v._id === lastFinishedVideo
          );
          if (lastIndex !== -1 && lastIndex + 1 < videosData.length) {
            nextVideoId = videosData[lastIndex + 1]._id; // next video
          }
        }

        setSelectedVideo(nextVideoId);
      } catch (err) {
        console.error(err);
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
              isWatched={video._id < selectedVideo}
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
