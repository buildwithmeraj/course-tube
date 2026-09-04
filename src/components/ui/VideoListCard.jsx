"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { FaCheckCircle, FaPlayCircle, FaBan } from "react-icons/fa";

const VideoListCard = ({ video, isSelected, course, isWatched }) => {
  const cardRef = useRef(null);
  const isWatchedButNotSelected = isWatched && !isSelected;
  const unavailable = Boolean(video.unavailable);

  useEffect(() => {
    if (isSelected && isWatched && cardRef.current) {
      cardRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "start",
      });
    }
  }, [isSelected, isWatched]);

  return (
    <Link
      ref={cardRef}
      href={`/courses/${video.courseId}/videos?video=${video._id}`}
      className={`
        grid gap-2 items-start 
        grid-cols-7 md:grid-cols-3 
        ${isSelected ? "border-blue-500" : "border-gray-300"}
      `}
    >
      <figure
        className="
          relative group 
          col-span-3 md:col-span-1 
          lg:max-w-48 
          rounded-lg
        "
      >
        <Image
          src={video.thumbnail}
          alt={video.title}
          width={0}
          height={0}
          sizes="100vw"
          className={`
            w-full h-auto
            lg:max-w-48 
            rounded-lg 
            ${isWatchedButNotSelected ? "opacity-50" : ""}
            ${isSelected ? "border-4 border-blue-500" : "border border-base-content"}
          `}
        />

        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          {video.position + 1}/{course?.totalCount || "?"}
        </div>

        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          {unavailable ? "Unavailable" : video.duration}
        </div>

        <div
          className="absolute inset-0 flex items-center justify-center
            bg-black/40 text-white opacity-0 group-hover:opacity-100 
            transition-opacity rounded-lg mr-2"
        >
          <FaPlayCircle size={36} />
        </div>
      </figure>

      <h4
        className={`
          col-span-4 md:col-span-2 text-sm line-clamp-3
          ${isWatchedButNotSelected ? "text-base-content/60" : "text-base-content"}
          ${isSelected ? "text-info" : ""} hover:text-info
        `}
      >
        {unavailable && (
          <FaBan
            className="inline text-error mr-1 mb-0.5"
            title="No longer available on YouTube"
          />
        )}
        {!unavailable && isWatchedButNotSelected && (
          <FaCheckCircle className="inline text-success mr-1 mb-0.5" />
        )}{" "}
        {isSelected && <FaPlayCircle className="inline mr-1 mb-1" />}{" "}
        {video.title}
      </h4>
    </Link>
  );
};

export default VideoListCard;
