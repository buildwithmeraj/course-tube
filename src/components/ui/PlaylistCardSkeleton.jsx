import React from "react";

const PlaylistCardSkeleton = () => {
  return (
    <div className="rounded-lg animate-pulse">
      <div className="stack w-full">
        <div className="relative">
          <div className="w-full aspect-video rounded-xl bg-base-300 skeleton">
            <div className="absolute bottom-2 left-2 h-5 w-24 bg-base-200 rounded" />
            <div className="absolute bottom-2 right-2 h-5 w-20 bg-base-200 rounded" />
          </div>
        </div>

        <div className="card shadow-md bg-base-300 h-24 skeleton"></div>
        <div className="card shadow-md bg-base-200 h-24 skeleton"></div>
      </div>

      <div className="mt-2 space-y-2">
        <div className="h-5 w-3/4 bg-base-300 rounded skeleton" />
      </div>
    </div>
  );
};

export default PlaylistCardSkeleton;
