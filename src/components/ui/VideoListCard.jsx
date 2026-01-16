import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { FaPlayCircle } from "react-icons/fa";

const VideoListCard = ({ video, isSelected, course, isWatched }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    if (isSelected && cardRef.current) {
      cardRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "start",
      });
    }
  }, [isSelected]);

  return (
    <Link
      ref={cardRef}
      href={`/courses/${video.courseId}/videos?video=${video._id}`}
      className={`grid grid-cols-7 gap-2 items-start ${
        isSelected ? "border-blue-500" : "border-gray-300"
      }`}
    >
      <figure className="relative group col-span-3">
        <Image
          src={video.thumbnail}
          alt={video.title}
          width={0}
          height={0}
          sizes="100vw"
          className={`w-48 rounded-lg ${isWatched ? "opacity-50" : ""} ${
            isSelected ? "border-4 border-blue-500" : ""
          }`}
        />
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          {video.position + 1}/{course?.totalCount || "?"}
        </div>
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          {video.duration}
        </div>
        <div
          className="absolute inset-0 flex items-center justify-center
                          bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-lg mr-2"
        >
          <FaPlayCircle size={36} />
        </div>
      </figure>
      <h3
        className={`col-span-4 card-title ${
          isWatched ? "text-base-content/60" : "text-base-content"
        } ${isSelected ? "text-info" : ""} hover:text-info`}
      >
        {`${isWatched ? "✓" : ""} ${isSelected ? "⮞" : ""} ${video.title}`}
      </h3>
    </Link>
  );
};

export default VideoListCard;
