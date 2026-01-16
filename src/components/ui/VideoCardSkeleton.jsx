const VideoCardSkeleton = () => {
  return (
    <div className="cursor-pointer rounded-xl animate-pulse">
      <div className="relative">
        <div className="w-full aspect-video rounded-xl bg-base-300 skeleton">
          <div className="absolute bottom-2 left-2 w-14 h-5 bg-base-200 rounded" />
          <div className="absolute bottom-2 right-2 w-12 h-5 bg-base-200 rounded" />
        </div>
      </div>

      <div className="mt-2 space-y-2">
        <div className="h-5 w-full bg-base-300 rounded skeleton" />
        <div className="h-5 w-3/4 bg-base-300 rounded skeleton" />
      </div>
    </div>
  );
};

export default VideoCardSkeleton;
