import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FaCheck, FaPlay } from "react-icons/fa";

// Same state language as VideoListCard: a moss check for watched, an amber
// equaliser for the one playing, both centred on the thumbnail.
const BAR_HEIGHTS = ["55%", "100%", "70%", "85%"];

const VideoCard = ({ video, isSelected, course, isWatched, isEnrolled }) => {
  const watched = isEnrolled && isWatched && !isSelected;
  const playing = isEnrolled && isSelected;

  return (
    <Link
      href={`/courses/${video.courseId}/videos?video=${video._id}`}
      className="group block"
    >
      <figure
        className={`@container relative overflow-hidden rounded-box border ${
          playing ? "border-accent" : "border-hairline"
        }`}
      >
        <Image
          src={video.thumbnail}
          alt={video.title}
          width={0}
          height={0}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 25vw, 20vw"
          className={`w-full ${watched ? "opacity-50" : ""}`}
        />

        {playing && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40">
            <span
              className="flex h-[22cqw] items-end gap-[1.5cqw]"
              role="img"
              aria-label="Now playing"
            >
              {BAR_HEIGHTS.map((height, index) => (
                <span
                  key={index}
                  className="eq-bar w-[3cqw] rounded-xs bg-accent"
                  style={{ height, animationDelay: `${index * 130}ms` }}
                />
              ))}
            </span>
          </div>
        )}

        {watched && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="flex aspect-square w-[18cqw] items-center justify-center rounded-full bg-success text-[8cqw] text-success-content">
              <FaCheck />
            </span>
          </div>
        )}

        <div className="figure-text absolute bottom-2 left-2 rounded-selector bg-black/60 px-1.5 py-0.5 text-xs text-white">
          {video.position + 1}/{course?.totalCount || "?"}
        </div>
        <div className="figure-text absolute right-2 bottom-2 rounded-selector bg-black/60 px-1.5 py-0.5 text-xs text-white">
          {video.duration}
        </div>

        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100">
            <FaPlay size={26} />
          </div>
        )}
      </figure>

      <h3
        className={`card-heading mt-2 line-clamp-2 ${
          watched ? "text-base-content/60" : "text-base-content"
        }`}
      >
        {video.title}
      </h3>
    </Link>
  );
};

export default VideoCard;
