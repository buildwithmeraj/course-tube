"use client";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { FaPlay } from "react-icons/fa";
import PlayerControls from "./PlayerControls";

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

// Matches YouTube's own arrow-key step.
const SEEK_STEP_SECONDS = 5;

// Keys pressed while typing belong to the field, not the player. The notes
// input sits a few hundred pixels below the video, so this matters.
const isTypingTarget = (el) =>
  Boolean(el) &&
  (el.isContentEditable ||
    el.tagName === "INPUT" ||
    el.tagName === "TEXTAREA" ||
    el.tagName === "SELECT");

// hqdefault exists for every video (maxresdefault does not). It is 4:3 with
// letterbox bars, so object-cover crops back to the 16:9 frame.
const posterFor = (videoId) =>
  `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

// Touch devices keep YouTube's own controls: they are tuned for a finger, and
// a custom bar would be a downgrade there. Pointer devices get ours instead,
// which is the only way to drop YouTube's title strip and hover chrome.
const COARSE_QUERY = "(pointer: coarse)";

const subscribeCoarse = (onChange) => {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mq = window.matchMedia(COARSE_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};

const useCoarsePointer = () =>
  useSyncExternalStore(
    subscribeCoarse,
    () => window.matchMedia?.(COARSE_QUERY).matches ?? false,
    () => false,
  );

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
  const wrapperRef = useRef(null);
  const playerRef = useRef(null);
  const coarsePointer = useCoarsePointer();
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
          controls: coarsePointer ? 1 : 0,
          rel: 0, // Related videos stay on the same channel
          autoplay: 1, // Only ever reached from a user gesture
          start,
          // Without this iOS Safari takes the video fullscreen the moment it
          // plays, which loses the chapter list and the notes field.
          playsinline: 1,
          iv_load_policy: 3, // No annotation overlays on top of the lesson
          modestbranding: 1, // Deprecated by YouTube; harmless to keep asking
        },
        events: {
          onReady: () => {
            if (!coarsePointer) {
              playerRef.current?.unloadModule?.("captions");
              playerRef.current?.unloadModule?.("cc");
            }
          },
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
  }, [activated, coarsePointer, video?.videoId, startTicking, stopTicking]);

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

  // Seek with the arrow keys without having to click into the iframe first.
  // Once focus *is* inside the iframe these events never reach the document,
  // so YouTube's own handling takes over and the two cannot both fire.
  useEffect(() => {
    if (!activated) return;

    const onKeyDown = (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;

      const player = playerRef.current;
      if (!player?.getCurrentTime || !player.seekTo) return;

      event.preventDefault();

      const step =
        event.key === "ArrowRight" ? SEEK_STEP_SECONDS : -SEEK_STEP_SECONDS;
      const duration = player.getDuration?.() || 0;
      const target = Math.max(0, player.getCurrentTime() + step);

      player.seekTo(duration > 0 ? Math.min(target, duration) : target, true);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [activated]);

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
      <div
        ref={wrapperRef}
        className="relative w-full overflow-hidden rounded-box bg-black pt-[56.25%]"
      >
        {activated ? (
          <>
            <div ref={containerRef} className="absolute inset-0 h-full w-full" />
            {!coarsePointer && (
              <PlayerControls playerRef={playerRef} wrapperRef={wrapperRef} />
            )}
          </>
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
