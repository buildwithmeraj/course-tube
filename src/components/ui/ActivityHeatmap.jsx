"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { FaFire } from "react-icons/fa6";

const LEVELS = [
  "bg-base-300",
  "bg-success/30",
  "bg-success/55",
  "bg-success/80",
  "bg-success",
];

const levelFor = (count) => {
  if (count === 0) return 0;
  if (count < 3) return 1;
  if (count < 6) return 2;
  if (count < 12) return 3;
  return 4;
};

// Six months of study activity, derived from when progress was last saved.
const ActivityHeatmap = () => {
  const { status } = useSession();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (status !== "authenticated") return;

    let cancelled = false;
    const tzOffset = new Date().getTimezoneOffset();

    fetch(`/api/stats/activity?tzOffset=${tzOffset}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      });

    return () => {
      cancelled = true;
    };
  }, [status]);

  if (status !== "authenticated" || !data?.days?.length) return null;

  // Pad the front so each column is a week starting on Sunday
  const leading = new Date(`${data.days[0].date}T00:00:00Z`).getUTCDay();
  const cells = [...Array(leading).fill(null), ...data.days];
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <div className="mt-6 rounded-xl border border-base-200 bg-base-100 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="card-heading text-base-content">
          Study activity
        </h3>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5 font-semibold text-warning">
            <FaFire />
            {data.currentStreak} day streak
          </span>
          <span className="text-base-content/60">
            best {data.longestStreak} · {data.activeDays} active days
          </span>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <div className="flex gap-[3px]">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[3px]">
              {week.map((day, dayIndex) =>
                day ? (
                  <div
                    key={day.date}
                    className={`h-3 w-3 rounded-[2px] ${LEVELS[levelFor(day.count)]}`}
                    title={`${day.date}: ${day.count} video${day.count === 1 ? "" : "s"}`}
                  />
                ) : (
                  <div key={`pad-${dayIndex}`} className="h-3 w-3" />
                ),
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-xs text-base-content/50">
        <span>Less</span>
        {LEVELS.map((level, index) => (
          <span key={index} className={`h-3 w-3 rounded-[2px] ${level}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
