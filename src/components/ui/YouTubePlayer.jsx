"use client";
import { useEffect, useRef } from "react";

const YouTubePlayer = ({ video, onEnd, course }) => {
  const playerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!video) return;

    // Create <script> for YouTube API if not already loaded
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }

    // Function to initialize the player
    const onYouTubeIframeAPIReady = () => {
      if (!containerRef.current) return;

      // Destroy previous player if exists
      if (playerRef.current) {
        playerRef.current.destroy();
      }

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: video.videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          controls: 1,
          modestbranding: 1,
          rel: 0, // Do not show related videos
        },
        events: {
          onStateChange: (event) => {
            // 0 = ended
            if (event.data === window.YT.PlayerState.ENDED) {
              console.log("Video finished:", video.title);
              if (onEnd) onEnd(video);
            }
          },
        },
      });
    };

    // If YT API already loaded
    if (window.YT && window.YT.Player) {
      onYouTubeIframeAPIReady();
    } else {
      window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    }

    // Cleanup
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [video, onEnd]);

  return (
    <div className="w-full">
      <div className="relative w-full pt-[56.25%]">
        <div
          ref={containerRef}
          className="absolute inset-0 w-full h-full rounded-xl"
        ></div>
      </div>
      {video && (
        <h2 className="mt-2 font-semibold">
          {video.position + 1}/{course?.totalCount} {video.title}
        </h2>
      )}
    </div>
  );
};

export default YouTubePlayer;
