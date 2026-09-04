"use client";
import { useCallback, useEffect, useImperativeHandle, useRef } from "react";

const IFRAME_API_SRC = "https://www.youtube.com/iframe_api";

// The IFrame API is a single global with a single ready callback, so it is
// loaded once per page and shared by every player that asks for it.
let apiPromise = null;

const loadYouTubeApi = () => {
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve(window.YT);
      return;
    }

    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve(window.YT);
    };

    if (!document.querySelector(`script[src="${IFRAME_API_SRC}"]`)) {
      const tag = document.createElement("script");
      tag.src = IFRAME_API_SRC;
      document.body.appendChild(tag);
    }
  });

  return apiPromise;
};

const PROGRESS_INTERVAL_MS = 5000;

const YouTubePlayer = ({
  video,
  onEnd,
  course,
  startSeconds = 0,
  onProgress,
  seekRequest,
  ref,
}) => {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const loadedVideoIdRef = useRef(null);

  // Latest values without making them effect dependencies: `onEnd` is a fresh
  // function on every parent render, and depending on it used to tear the
  // player down and rebuild it mid-playback.
  const onEndRef = useRef(onEnd);
  const onProgressRef = useRef(onProgress);
  const videoRef = useRef(video);
  const startSecondsRef = useRef(startSeconds);
  const tickRef = useRef(null);

  useEffect(() => {
    onEndRef.current = onEnd;
    onProgressRef.current = onProgress;
    videoRef.current = video;
    startSecondsRef.current = startSeconds;
  });

  // Report the play head while playing so progress can be resumed later
  const stopTicking = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const startTicking = useCallback(() => {
    stopTicking();
    tickRef.current = setInterval(() => {
      const player = playerRef.current;
      if (!player?.getCurrentTime) return;
      onProgressRef.current?.(
        player.getCurrentTime(),
        player.getDuration?.() || 0,
        videoRef.current,
      );
    }, PROGRESS_INTERVAL_MS);
  }, [stopTicking]);

  useEffect(() => {
    const videoId = video?.videoId;
    if (!videoId) return;

    // Already running: swap the source instead of rebuilding the player
    if (playerRef.current) {
      if (loadedVideoIdRef.current !== videoId) {
        loadedVideoIdRef.current = videoId;
        playerRef.current.loadVideoById({
          videoId,
          startSeconds: Math.max(0, Math.floor(startSecondsRef.current || 0)),
        });
      }
      return;
    }

    let cancelled = false;

    loadYouTubeApi().then((YT) => {
      // The container is replaced by an iframe on construction, so build at
      // most one player for the lifetime of this component
      if (cancelled || playerRef.current || !containerRef.current) return;

      loadedVideoIdRef.current = videoId;
      playerRef.current = new YT.Player(containerRef.current, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          controls: 1,
          modestbranding: 1,
          rel: 0, // Do not show related videos
          start: Math.max(0, Math.floor(startSecondsRef.current || 0)),
        },
        events: {
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.PLAYING) {
              startTicking();
              return;
            }

            stopTicking();

            if (event.data === YT.PlayerState.ENDED) {
              const player = playerRef.current;
              onProgressRef.current?.(
                player?.getDuration?.() || 0,
                player?.getDuration?.() || 0,
                videoRef.current,
              );
              onEndRef.current?.(videoRef.current);
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
    };
  }, [video?.videoId, startTicking, stopTicking]);

  // Lets the parent read the exact play head when a note is written, rather
  // than the value from the last 5-second tick.
  useImperativeHandle(
    ref,
    () => ({
      getCurrentTime: () => playerRef.current?.getCurrentTime?.() ?? 0,
    }),
    [],
  );

  // Chapter clicks arrive as { seconds, nonce }; the nonce makes repeat clicks
  // on the same chapter seek again.
  useEffect(() => {
    if (!seekRequest || !playerRef.current?.seekTo) return;
    playerRef.current.seekTo(Math.max(0, Math.floor(seekRequest.seconds)), true);
    playerRef.current.playVideo?.();
  }, [seekRequest]);

  // Tear down only when the component actually goes away
  useEffect(
    () => () => {
      stopTicking();
      playerRef.current?.destroy?.();
      playerRef.current = null;
      loadedVideoIdRef.current = null;
    },
    [stopTicking],
  );

  return (
    <div className="w-full">
      <div className="relative w-full pt-[56.25%]">
        <div
          ref={containerRef}
          className="absolute inset-0 w-full h-full rounded-xl"
        ></div>
      </div>
      {video && (
        <h3 className="subsection-title mt-2">
          <span className="badge badge-lg badge-info badge-soft rounded-xl mr-2">
            {video.position + 1}/{course?.totalCount}
          </span>{" "}
          {video.title}
        </h3>
      )}
    </div>
  );
};

export default YouTubePlayer;
