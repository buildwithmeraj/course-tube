"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FaPause,
  FaPlay,
  FaVolumeHigh,
  FaVolumeXmark,
  FaExpand,
  FaCompress,
  FaClosedCaptioning,
} from "react-icons/fa6";

const RATES = [0.75, 1, 1.25, 1.5, 1.75, 2];
const HIDE_AFTER_MS = 2000;
const POLL_MS = 250;

const stamp = (seconds) => {
  const s = Math.max(0, Math.floor(seconds || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
};

// Our own bar, shown only on pointer devices. It replaces YouTube's chrome —
// the title strip, share button and "More videos" overlay all come with
// controls=1 and cannot be turned off individually.
const PlayerControls = ({ playerRef, wrapperRef }) => {
  const [state, setState] = useState({
    playing: false,
    current: 0,
    duration: 0,
    buffered: 0,
    muted: false,
    volume: 100,
    rate: 1,
  });
  const [visible, setVisible] = useState(true);
  const [scrubbing, setScrubbing] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [rateOpen, setRateOpen] = useState(false);
  const [captions, setCaptions] = useState(false);
  const hideTimer = useRef(null);

  // Poll rather than rely on events: the IFrame API has no timeupdate, and a
  // quarter-second read is cheap next to video decoding.
  useEffect(() => {
    const id = setInterval(() => {
      const p = playerRef.current;
      if (!p?.getCurrentTime) return;

      setState((prev) => ({
        playing: p.getPlayerState?.() === 1,
        current: scrubbing ? prev.current : p.getCurrentTime(),
        duration: p.getDuration?.() || 0,
        buffered: p.getVideoLoadedFraction?.() || 0,
        muted: p.isMuted?.() ?? false,
        volume: p.getVolume?.() ?? 100,
        rate: p.getPlaybackRate?.() ?? 1,
      }));
    }, POLL_MS);

    return () => clearInterval(id);
  }, [playerRef, scrubbing]);

  const show = useCallback(() => {
    setVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setVisible(false), HIDE_AFTER_MS);
  }, []);

  // Paused, scrubbing or picking a speed keeps the bar up regardless
  const pinned = !state.playing || scrubbing || rateOpen;
  const barShown = visible || pinned;

  useEffect(() => {
    if (pinned && hideTimer.current) clearTimeout(hideTimer.current);
  }, [pinned]);

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const togglePlay = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    if (p.getPlayerState?.() === 1) p.pauseVideo?.();
    else p.playVideo?.();
    show();
  }, [playerRef, show]);

  const toggleFullscreen = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else el.requestFullscreen?.();
  }, [wrapperRef]);

  const seekTo = (seconds) => {
    playerRef.current?.seekTo?.(Math.max(0, seconds), true);
    setState((prev) => ({ ...prev, current: seconds }));
  };

  const pct = state.duration > 0 ? (state.current / state.duration) * 100 : 0;
  const bufferedPct = state.buffered * 100;

  return (
    <>
      {/* Transparent layer over the iframe: an iframe swallows mouse events,
          so without this the bar would never know the pointer moved. */}
      <button
        type="button"
        aria-label={state.playing ? "Pause" : "Play"}
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
        onMouseMove={show}
        onMouseLeave={() => !pinned && setVisible(false)}
        className="absolute inset-0 z-10 cursor-pointer"
        style={{ cursor: barShown ? "pointer" : "none" }}
      />

      <div
        onMouseMove={show}
        className={`absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black via-black/85 to-transparent px-3 pt-10 pb-3 transition-opacity duration-200 ${
          barShown ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <input
          type="range"
          min={0}
          max={Math.max(state.duration, 0.1)}
          step={0.1}
          value={state.current}
          aria-label="Seek"
          onPointerDown={() => setScrubbing(true)}
          onPointerUp={() => setScrubbing(false)}
          onChange={(e) => seekTo(Number(e.target.value))}
          className="player-scrub w-full"
          style={{
            "--played": `${pct}%`,
            "--buffered": `${bufferedPct}%`,
          }}
        />

        <div className="mt-1 flex items-center gap-2 text-white">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={state.playing ? "Pause" : "Play"}
            className="flex h-8 w-8 items-center justify-center rounded-field hover:bg-white/15"
          >
            {state.playing ? <FaPause size={13} /> : <FaPlay size={13} />}
          </button>

          <div className="group/vol flex items-center">
            <button
              type="button"
              onClick={() => {
                const p = playerRef.current;
                if (!p) return;
                if (p.isMuted?.()) p.unMute?.();
                else p.mute?.();
              }}
              aria-label={state.muted ? "Unmute" : "Mute"}
              className="flex h-8 w-8 items-center justify-center rounded-field hover:bg-white/15"
            >
              {state.muted || state.volume === 0 ? (
                <FaVolumeXmark size={13} />
              ) : (
                <FaVolumeHigh size={13} />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={state.muted ? 0 : state.volume}
              aria-label="Volume"
              onChange={(e) => {
                const v = Number(e.target.value);
                const p = playerRef.current;
                if (!p) return;
                if (v > 0 && p.isMuted?.()) p.unMute?.();
                p.setVolume?.(v);
              }}
              className="player-scrub w-0 opacity-0 transition-all group-hover/vol:ml-1 group-hover/vol:w-20 group-hover/vol:opacity-100"
              style={{
                "--played": `${state.muted ? 0 : state.volume}%`,
                "--buffered": "0%",
              }}
            />
          </div>

          <span className="figure-text text-xs tabular-nums">
            {stamp(state.current)}{" "}
            <span className="text-white/50">/ {stamp(state.duration)}</span>
          </span>

          <div className="relative ml-auto">
            <button
              type="button"
              onClick={() => setRateOpen((o) => !o)}
              aria-expanded={rateOpen}
              className="figure-text flex h-8 items-center rounded-field px-2 text-xs hover:bg-white/15"
            >
              {state.rate}×
            </button>
            {rateOpen && (
              <div className="absolute right-0 bottom-10 flex flex-col overflow-hidden rounded-field bg-black/90 py-1">
                {RATES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      playerRef.current?.setPlaybackRate?.(r);
                      setRateOpen(false);
                    }}
                    className={`figure-text px-3 py-1 text-left text-xs hover:bg-white/15 ${
                      state.rate === r ? "text-accent" : ""
                    }`}
                  >
                    {r}×
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              const p = playerRef.current;
              if (!p) return;
              if (captions) {
                p.unloadModule?.("captions");
                p.unloadModule?.("cc");
              } else {
                p.loadModule?.("captions");
                p.loadModule?.("cc");
              }
              setCaptions((c) => !c);
            }}
            aria-pressed={captions}
            aria-label="Subtitles"
            title="Subtitles"
            className={`flex h-8 w-8 items-center justify-center rounded-field hover:bg-white/15 ${
              captions ? "text-accent" : ""
            }`}
          >
            <FaClosedCaptioning size={14} />
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={fullscreen ? "Exit full screen" : "Full screen"}
            className="flex h-8 w-8 items-center justify-center rounded-field hover:bg-white/15"
          >
            {fullscreen ? <FaCompress size={13} /> : <FaExpand size={13} />}
          </button>
        </div>
      </div>
    </>
  );
};

export default PlayerControls;
