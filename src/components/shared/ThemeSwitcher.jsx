"use client";
import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

// false while server-rendering, true once hydrated — no state update needed
const subscribe = () => () => {};
const useHydrated = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

const ThemeSwitcher = () => {
  const mounted = useHydrated();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const isDark = mounted && (theme === "dark" || resolvedTheme === "dark");

  if (!mounted) {
    return <div className="place-self-center h-7 w-[52px]" aria-hidden="true" />;
  }

  return (
    <label className="place-self-center relative inline-block h-7 w-[52px] cursor-pointer">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={isDark}
        onChange={(event) => setTheme(event.target.checked ? "dark" : "light")}
        aria-label="Toggle dark mode"
      />

      {/* track */}
      <span className="absolute inset-0 rounded-full bg-base-300 transition-colors duration-300 peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2" />

      {/* sun */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="pointer-events-none absolute top-[5px] left-[29px] z-10 h-[18px] w-[18px] text-warning motion-safe:animate-[spin_15s_linear_infinite]"
      >
        <g fill="currentColor">
          <circle r={5} cy={12} cx={12} />
          <path d="m21 13h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2zm-17 0h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2zm13.66-5.66a1 1 0 0 1 -.66-.29 1 1 0 0 1 0-1.41l.71-.71a1 1 0 1 1 1.41 1.41l-.71.71a1 1 0 0 1 -.75.29zm-12.02 12.02a1 1 0 0 1 -.71-.29 1 1 0 0 1 0-1.41l.71-.66a1 1 0 0 1 1.41 1.41l-.71.71a1 1 0 0 1 -.7.24zm6.36-14.36a1 1 0 0 1 -1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1 -1 1zm0 17a1 1 0 0 1 -1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1 -1 1zm-5.66-14.66a1 1 0 0 1 -.7-.29l-.71-.71a1 1 0 0 1 1.41-1.41l.71.71a1 1 0 0 1 0 1.41 1 1 0 0 1 -.71.29zm12.02 12.02a1 1 0 0 1 -.7-.29l-.66-.71a1 1 0 0 1 1.36-1.36l.71.71a1 1 0 0 1 0 1.41 1 1 0 0 1 -.71.24z" />
        </g>
      </svg>

      {/* moon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 384 512"
        className="pointer-events-none absolute top-[5px] left-[6px] z-10 h-[18px] w-[18px] fill-base-100"
      >
        <path d="m223.5 32c-123.5 0-223.5 100.3-223.5 224s100 224 223.5 224c60.6 0 115.5-24.2 155.8-63.4 5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6-96.9 0-175.5-78.8-175.5-176 0-65.8 36-123.1 89.3-153.3 6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z" />
      </svg>

      {/* knob */}
      <span className="pointer-events-none absolute bottom-[2px] left-[2px] z-20 h-6 w-6 rounded-full bg-base-100 transition-transform duration-400 peer-checked:translate-x-[24px]" />
    </label>
  );
};

export default ThemeSwitcher;
