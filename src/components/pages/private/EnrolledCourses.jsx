import Image from "next/image";
import Link from "next/link";
import { FaPlay, FaRegClock, FaVideo, FaCheck } from "react-icons/fa6";
import { RiPlayListAddFill } from "react-icons/ri";
import { listEnrolledWithProgress } from "@/lib/enrolledCourses";
import { formatDuration } from "@/lib/duration";
import { languageLabel } from "@/lib/languages";

// A tracker's own list has to show progress, and progress only compares when
// the bars line up in a column — so this is rows, ordered by what to do next.
const EnrolledCourses = async () => {
  const rows = await listEnrolledWithProgress();

  if (rows.length === 0) {
    return (
      <div>
        <h1 className="page-title">Your courses</h1>
        <div className="rounded-box border border-hairline bg-base-100 p-10 text-center">
          <p className="font-semibold">You have not enrolled in anything yet.</p>
          <p className="mt-1 text-sm text-base-content/60">
            Enrolling keeps your progress, notes and resume position.
          </p>
          <Link href="/courses" className="btn btn-primary btn-sm mt-4">
            Browse courses
          </Link>
        </div>
      </div>
    );
  }

  const inProgress = rows.filter(
    (r) => r.lastActiveAt && r.completedCount < r.totalCount,
  ).length;
  const finished = rows.filter(
    (r) => r.totalCount > 0 && r.completedCount >= r.totalCount,
  ).length;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title mb-0">Your courses</h1>
          <p className="figure-text mt-1 text-xs text-base-content/60">
            {rows.length} enrolled · {inProgress} in progress · {finished}{" "}
            finished
          </p>
        </div>
        <Link href="/profile/courses/add" className="btn btn-primary btn-sm">
          <RiPlayListAddFill size={14} />
          Add playlist
        </Link>
      </div>

      <div className="overflow-hidden rounded-box border border-hairline bg-base-100">
        {rows.map((row) => {
          const course = row.course;
          const total = row.totalCount || course.totalCount || 0;
          const done = row.completedCount || 0;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          const complete = total > 0 && done >= total;
          const started = Boolean(row.lastActiveAt);

          const href = row.lastVideoId
            ? `/courses/${course._id}/videos?video=${row.lastVideoId}`
            : `/courses/${course._id}/videos`;

          return (
            <div
              key={course._id}
              className="grid grid-cols-[104px_1fr] items-center gap-4 border-b border-hairline p-3 last:border-b-0 hover:bg-surface lg:grid-cols-[104px_1fr_180px_auto]"
            >
              <Link
                href={href}
                className="relative aspect-video overflow-hidden rounded-field bg-base-300"
              >
                <Image
                  src={course.thumbnailUrl}
                  alt=""
                  fill
                  sizes="104px"
                  className={`object-cover ${complete ? "opacity-60" : ""}`}
                />
                {complete && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success text-success-content">
                      <FaCheck size={11} />
                    </span>
                  </span>
                )}
              </Link>

              <div className="min-w-0">
                <Link
                  href={`/courses/${course._id}`}
                  className="card-heading line-clamp-2 hover:text-primary"
                >
                  {course.title}
                </Link>
                <div className="figure-text mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-base-content/60">
                  <span className="flex items-center gap-1">
                    <FaVideo size={10} />
                    {total || course.totalCount}
                  </span>
                  {course.totalDurationSeconds > 0 && (
                    <span className="flex items-center gap-1">
                      <FaRegClock size={10} />
                      {formatDuration(course.totalDurationSeconds)}
                    </span>
                  )}
                  {languageLabel(course.language) && (
                    <span className="rounded-selector border border-hairline px-1.5">
                      {languageLabel(course.language)}
                    </span>
                  )}
                  {/* Progress is the point of this page, so it also appears
                      inline where the column is hidden */}
                  <span className="lg:hidden">
                    {complete ? "Finished" : `${done} of ${total} done`}
                  </span>
                </div>
              </div>

              <div className="hidden lg:block">
                <div className="figure-text mb-1 flex items-baseline justify-between text-xs">
                  <span className={complete ? "text-success" : ""}>
                    {complete ? "Finished" : `${done} / ${total}`}
                  </span>
                  <span className="text-base-content/50">{pct}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-base-300">
                  <div
                    className={`h-full ${complete ? "bg-success" : "bg-accent"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <Link
                href={href}
                className={`btn btn-sm ${complete ? "btn-ghost" : "btn-primary"} hidden lg:inline-flex`}
              >
                <FaPlay size={10} />
                {complete ? "Rewatch" : started ? "Resume" : "Start"}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EnrolledCourses;
