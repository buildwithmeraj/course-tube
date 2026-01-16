"use client";
import VideoCard from "@/components/ui/VideoCard";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const CourseDetails = () => {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [course, setCourse] = useState([]);
  const { id } = useParams();

  useEffect(() => {
    if (!id) return;

    const fetchVideosAndProgress = async () => {
      try {
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
      }
    };

    fetchVideosAndProgress();
  }, [id]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {videos.map((video) => (
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
    </div>
  );
};

export default CourseDetails;
