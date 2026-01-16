import React from "react";

const VideoListCardSkeleton = () => {
  return (
    <div className="grid grid-cols-7 gap-2 items-start animate-pulse">
      <div className="col-span-3">
        <div className="w-48 h-28 rounded-lg bg-base-300 skeleton relative">
          <div className="absolute bottom-2 left-2 w-10 h-4 bg-base-200 rounded" />
          <div className="absolute bottom-2 right-2 w-10 h-4 bg-base-200 rounded" />
        </div>
      </div>

      <div className="col-span-4 space-y-2 mt-1">
        <div className="h-4 w-full bg-base-300 rounded skeleton" />
        <div className="h-4 w-3/4 bg-base-300 rounded skeleton" />
      </div>
    </div>
  );
};

export default VideoListCardSkeleton;
