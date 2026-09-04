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
    className="flex h-[22cqw] items-end gap-[1.5cqw]"
    role="img"
    aria-label="Now playing"
  >
    {BAR_HEIGHTS.map((height, index) => (
      <span
        key={index}
        className="eq-bar w-[3cqw] rounded-xs bg-white"
        style={{ height, animationDelay: `${index * 130}ms` }}
      />
    ))}
  </span>
);

// The nearest ancestor that actually scrolls, so we can move the list without
// moving the document behind it.
const scrollParent = (node) => {
  for (let el = node.parentElement; el; el = el.parentElement) {
    const { overflowY } = getComputedStyle(el);
    const scrolls = overflowY === "auto" || overflowY === "scroll";
    if (scrolls && el.scrollHeight > el.clientHeight) return el;
  }
  return null;
};

const VideoListCard = ({ video, isSelected, course, isWatched }) => {
  const cardRef = useRef(null);
  const isWatchedButNotSelected = isWatched && !isSelected;
  const unavailable = Boolean(video.unavailable);

  // Keep the playing card in view inside the list's own scroll box. This was
  // scrollIntoView keyed on isWatched, which scrolled the whole page — and did
  // so mid-playback, since a video flips to watched at 90%, nudging the player
  // out from under the reader just as it was finishing.
  useEffect(() => {
    const card = cardRef.current;
    if (!isSelected || !card) return;

    const list = scrollParent(card);
    if (!list) return;

    const cardBox = card.getBoundingClientRect();
    const listBox = list.getBoundingClientRect();
    if (cardBox.top >= listBox.top && cardBox.bottom <= listBox.bottom) return;

    list.scrollTo({
      top: list.scrollTop + (cardBox.top - listBox.top) - 8,
      behavior: "smooth",
    });
  }, [isSelected]);

  return (
    <Link
      ref={cardRef}
      href={`/courses/${video.courseId}/videos?video=${video._id}`}
      className="grid grid-cols-7 items-start gap-2 md:grid-cols-3"
    >
      <figure className="group @container relative col-span-3 rounded-lg md:col-span-1 lg:max-w-48">
        <Image
          src={video.thumbnail}
          alt={video.title}
          // Every stored thumbnail is YouTube's mqdefault, which is 320x180.
          // Declaring it reserves the box before the image loads, so the list
          // stops growing under the scroll that brings the playing card in.
          width={320}
          height={180}
          sizes="(max-width: 1024px) 40vw, 192px"
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
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="flex aspect-square w-[24cqw] items-center justify-center rounded-full bg-success text-[11cqw] text-success-content shadow-sm">
              <FaCheck />
            </span>
          </div>
        )}

        {unavailable && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="flex aspect-square w-[24cqw] items-center justify-center rounded-full bg-error text-[11cqw] text-error-content shadow-sm">
              <FaBan />
            </span>
          </div>
        )}

        <div className="figure-text absolute bottom-1.5 left-1.5 hidden rounded-selector bg-black/60 px-1 py-0.5 text-[10px] text-white @[124px]:block">
          {video.position + 1}/{course?.totalCount || "?"}
        </div>

        <div className="figure-text absolute right-1.5 bottom-1.5 rounded-selector bg-black/60 px-1 py-0.5 text-[10px] text-white">
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
        className={`col-span-4 line-clamp-3 text-sm md:col-span-2 hover:text-primary ${
          isWatchedButNotSelected ? "text-base-content/60" : "text-base-content"
        } ${isSelected ? "font-semibold text-accent" : ""}`}
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
