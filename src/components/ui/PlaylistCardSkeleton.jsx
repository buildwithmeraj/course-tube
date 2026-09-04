import React from "react";

// Mirrors PlaylistCard: thumbnail, title line, meta line.
const PlaylistCardSkeleton = () => {
  return (
    <div>
      <div className="skeleton relative aspect-video w-full rounded-xl bg-base-300">
        <div className="absolute bottom-2 left-2 h-5 w-24 rounded-lg bg-base-200" />
        <div className="absolute right-2 bottom-2 h-5 w-20 rounded-lg bg-base-200" />
      </div>
      <div className="mt-2 space-y-2">
        <div className="skeleton h-5 w-3/4 rounded-lg bg-base-300" />
        <div className="skeleton h-4 w-1/2 rounded-lg bg-base-200" />
      </div>
    </div>
  );
};

export default PlaylistCardSkeleton;
