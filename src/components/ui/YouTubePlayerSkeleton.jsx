import React from "react";

const YouTubePlayerSkeleton = () => {
  return (
    <div className="w-full animate-pulse">
      <div className="relative w-full pt-[56.25%]">
        <div className="absolute inset-0 rounded-xl bg-base-300 skeleton" />
      </div>

      <div className="mt-2 space-y-2">
        <div className="h-7.5  w-3/4 bg-base-300 rounded skeleton" />
        <div className="h-7.5  w-1/2 bg-base-300 rounded skeleton" />
      </div>
    </div>
  );
};

export default YouTubePlayerSkeleton;
