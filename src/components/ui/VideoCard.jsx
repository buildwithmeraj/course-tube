import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FaPlayCircle } from "react-icons/fa";

const VideoCard = ({ video, isSelected, course, isWatched, isEnrolled }) => {
  return (
    <Link
      href={`/courses/${video.courseId}/videos?video=${video._id}`}
      className={`cursor-pointer rounded-xl ${
        isEnrolled & isSelected ? "border-blue-500" : "border-gray-300"
      }`}
    >
      <figure className="relative group">
        <Image
          src={video.thumbnail}
          alt={video.title}
          width={0}
          height={0}
          sizes="100vw"
          className={`w-full rounded-xl ${isEnrolled & isWatched ? "opacity-50" : ""} ${
            isEnrolled & isSelected ? "border-4 border-blue-500" : ""
          }`}
        />
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded">
          {video.position + 1}/{course?.totalCount || "?"}
        </div>
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded">
          {video.duration}
        </div>
        <div
          className="absolute inset-0 flex items-center justify-center
                          bg-black/40 text-white text-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
        >
          <FaPlayCircle size={56} />
        </div>
      </figure>
      <h3
        className={`card-title mt-2 ${
          isEnrolled & isWatched ? "text-base-content/60" : "text-base-content"
        } ${isEnrolled & isSelected ? "text-info" : ""}`}
      >
        {`${isEnrolled & isWatched ? "✓" : ""} ${isEnrolled & isSelected ? "⮞" : ""} ${video.title}`}
      </h3>
    </Link>
  );
};

export default VideoCard;
