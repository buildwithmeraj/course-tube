"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { FaCheck, FaPlay, FaBan } from "react-icons/fa";

// Four bars on a stagger. Heights differ so the still frame — which is what a
// reduced-motion viewer sees — still reads as an equaliser rather than a block.
const BAR_HEIGHTS = ["55%", "100%", "70%", "85%"];

const Equalizer = () => (
  <span
    className="flex h-4 items-end gap-[3px]"
    role="img"
    aria-label="Now playing"
  >
    {BAR_HEIGHTS.map((height, index) => (
      <span
        key={index}
        className="eq-bar w-[3px] rounded-xs bg-white"
        style={{ height, animationDelay: `${index * 130}ms` }}
      />
    ))}
  </span>
);

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
      className="grid grid-cols-7 items-start gap-2 md:grid-cols-3"
    >
      <figure className="group relative col-span-3 rounded-lg md:col-span-1 lg:max-w-48">
        <Image
          src={video.thumbnail}
          alt={video.title}
          width={0}
          height={0}
          sizes="100vw"
          className={`h-auto w-full rounded-lg lg:max-w-48 ${
            isWatchedButNotSelected ? "opacity-50" : ""
          } ${
            isSelected
              ? "border-4 border-primary"
              : "border border-base-content"
          }`}
        />

        {/* Playing: a live indicator over a scrim, so the current video is
            findable at a glance in a rail of sixty. */}
        {isSelected && !unavailable && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-black/40">
            <Equalizer />
          </div>
        )}

        {/* Watched: a check on the thumbnail itself, not only beside the
            title, so progress is scannable down the column. */}
        {isWatchedButNotSelected && !unavailable && (
          <div className="pointer-events-none absolute top-1.5 left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-success text-success-content shadow-sm">
            <FaCheck size={10} />
          </div>
        )}

        {unavailable && (
          <div className="pointer-events-none absolute top-1.5 left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-error text-error-content shadow-sm">
            <FaBan size={10} />
          </div>
        )}

        <div className="absolute bottom-2 left-2 rounded-lg bg-black/50 px-2 py-1 text-xs text-white">
          {video.position + 1}/{course?.totalCount || "?"}
        </div>

        <div className="absolute right-2 bottom-2 rounded-lg bg-black/50 px-2 py-1 text-xs text-white">
          {unavailable ? "Unavailable" : video.duration}
        </div>

        {/* Hover affordance, but never over the playing indicator */}
        {!isSelected && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100">
            <FaPlay size={26} />
          </div>
        )}
      </figure>

      <h4
        className={`col-span-4 line-clamp-3 text-sm md:col-span-2 hover:text-info ${
          isWatchedButNotSelected ? "text-base-content/60" : "text-base-content"
        } ${isSelected ? "font-semibold text-info" : ""}`}
      >
        {unavailable && (
          <FaBan
            className="mr-1 mb-0.5 inline text-error"
            title="No longer available on YouTube"
          />
        )}
        {video.title}
      </h4>
    </Link>
  );
};

export default VideoListCard;
