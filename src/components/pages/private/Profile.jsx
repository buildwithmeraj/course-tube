"use client";
import ActivityHeatmap from "@/components/ui/ActivityHeatmap";
import StatTile from "@/components/ui/StatTile";
import Loading from "@/components/ui/Loading";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FaGraduationCap, FaPlay, FaCheck, FaChevronRight } from "react-icons/fa6";

// Your record, not a second navigation menu: the rail already reaches every
// page, the home page already carries the resume card, and the enrolled list
// is its own page. What is left is who you are and how you are doing.
export default function Profile() {
  const { data: session, status } = useSession();
  const user = session?.user ?? {};
  const displayName = user?.name || user?.email?.split("@")?.[0] || "Learner";
  const role = user?.role || "student";
  const email = user?.email || "Not provided";
  const [stats, setStats] = useState(null);

  const statsLoading =
    status === "loading" || (Boolean(session?.user?.email) && stats === null);

  useEffect(() => {
    if (!session?.user?.email) return;

    let cancelled = false;

    fetch(`/api/stats/${session.user.email}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch(() => {
        if (!cancelled) {
          setStats({
            enrolledCount: 0,
            completedCount: 0,
            inProgressCount: 0,
            courses: [],
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [session?.user?.email]);

  // Lessons finished across every course, which is a truer measure of effort
  // than how many courses happen to be fully complete.
  const totals = useMemo(() => {
    const courses = stats?.courses ?? [];
    const lessonsDone = courses.reduce(
      (sum, c) => sum + (Number(c.completedVideos) || 0),
      0,
    );
    const lessonsTotal = courses.reduce(
      (sum, c) => sum + (Number(c.totalVideos) || 0),
      0,
    );
    const started = courses.filter(
      (c) => !c.completed && Number(c.completedVideos) > 0,
    ).length;

    return {
      enrolled: Number(stats?.enrolledCount || 0),
      finished: Number(stats?.completedCount || 0),
      started,
      lessonsDone,
      lessonsTotal,
      pct: lessonsTotal > 0 ? Math.round((lessonsDone / lessonsTotal) * 100) : 0,
    };
  }, [stats]);

  if (status === "loading") return <Loading />;

  const dash = statsLoading ? "—" : undefined;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-4 rounded-box border border-hairline bg-base-100 p-5">
        {user?.image ? (
          <Image
            src={user.image}
            alt=""
            width={64}
            height={64}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-content">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
        )}

        <div className="min-w-0">
          <h1 className="page-title mb-1">{displayName}</h1>
          <p className="figure-text flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-base-content/60">
            <span className="rounded-selector border border-hairline px-1.5 capitalize">
              {role}
            </span>
            <span className="truncate">{email}</span>
          </p>
        </div>

        <Link
          href="/profile/courses"
          className="btn btn-primary btn-sm ml-auto"
        >
          Your courses
          <FaChevronRight size={10} />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Enrolled"
          value={dash ?? totals.enrolled}
          hint="courses in your shelf"
          icon={FaGraduationCap}
        />
        <StatTile
          label="In progress"
          value={dash ?? totals.started}
          hint="started but not finished"
          icon={FaPlay}
        />
        <StatTile
          label="Finished"
          value={dash ?? totals.finished}
          hint="every lesson watched"
          icon={FaCheck}
        />
        <StatTile label="Lessons watched" value={dash ?? totals.lessonsDone}>
          <p className="mt-0.5 text-xs text-base-content/60">
            of {statsLoading ? "—" : totals.lessonsTotal} · {totals.pct}%
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-base-300">
            <div
              className="h-full bg-accent"
              style={{ width: `${totals.pct}%` }}
            />
          </div>
        </StatTile>
      </div>

      <ActivityHeatmap />
    </div>
  );
}
