"use client";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { FaPlay } from "react-icons/fa";

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

// hqdefault exists for every video (maxresdefault does not). It is 4:3 with
// letterbox bars, so object-cover crops back to the 16:9 frame.
const posterFor = (videoId) =>
  `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

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

  // Until someone presses play this renders a poster instead of the embed.
  // The YouTube player is ~1.1 MB, which used to load on arrival whether or
  // not the video was ever watched.
  const [pressedPlay, setPressedPlay] = useState(false);

  // A chapter or note click is itself a request to play, so it activates the
  // embed too. Derived rather than set in an effect, so the seek that triggered
  // it is still available when the player is built.
  const activated = pressedPlay || Boolean(seekRequest);

  // Latest values without making them effect dependencies: `onEnd` is a fresh
  // function on every parent render, and depending on it used to tear the
  // player down and rebuild it mid-playback.
  const onEndRef = useRef(onEnd);
  const onProgressRef = useRef(onProgress);
  const videoRef = useRef(video);
  const startSecondsRef = useRef(startSeconds);
  const seekRequestRef = useRef(seekRequest);
  const tickRef = useRef(null);

  useEffect(() => {
    onEndRef.current = onEnd;
    onProgressRef.current = onProgress;
    videoRef.current = video;
    startSecondsRef.current = startSeconds;
    seekRequestRef.current = seekRequest;
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
    if (!videoId || !activated) return;

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

      // Activated by a chapter/note click? Start there rather than at the
      // stored resume position.
      const start = Math.max(
        0,
        Math.floor(seekRequestRef.current?.seconds ?? startSecondsRef.current ?? 0),
      );

      loadedVideoIdRef.current = videoId;
      playerRef.current = new YT.Player(containerRef.current, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          controls: 1,
          modestbranding: 1,
          rel: 0, // Do not show related videos
          autoplay: 1, // Only ever reached from a user gesture
          start,
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
  }, [activated, video?.videoId, startTicking, stopTicking]);

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
  // on the same chapter seek again. The first one builds the player instead,
  // which already starts at the right second.
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
      <div className="relative w-full overflow-hidden rounded-box pt-[56.25%]">
        {activated ? (
          <div ref={containerRef} className="absolute inset-0 h-full w-full" />
        ) : (
          <button
            type="button"
            onClick={() => setPressedPlay(true)}
            className="group absolute inset-0 h-full w-full cursor-pointer bg-base-300"
            aria-label={video ? `Play ${video.title}` : "Play video"}
          >
            {video?.videoId && (
              <Image
                src={posterFor(video.videoId)}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
                priority
              />
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/45">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-content shadow-lg transition-transform group-hover:scale-110">
                <FaPlay size={22} className="ml-1" />
              </span>
            </span>
          </button>
        )}
      </div>
      {video && (
        <h3 className="subsection-title mt-2">
          <span className="badge badge-lg badge-info badge-soft mr-2 rounded-box">
            {video.position + 1}/{course?.totalCount}
          </span>{" "}
          {video.title}
        </h3>
      )}
    </div>
  );
};

export default YouTubePlayer;
