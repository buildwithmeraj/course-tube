import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FaRegClock, FaVideo } from "react-icons/fa6";
import { formatDuration } from "@/lib/duration";
import { languageLabel } from "@/lib/languages";

// The catalogue's shared row: lessons, runtime and enrolments sit in fixed
// columns so they compare down the page. Used by /courses and by a category,
// so a category reads as a filtered view of the catalogue.
const CourseTable = ({ courses }) => (
  <div className="overflow-hidden rounded-box border border-hairline bg-base-100">
    <div className="hidden grid-cols-[96px_1fr_92px_92px_84px] items-center gap-4 border-b border-hairline bg-surface px-4 py-2 md:grid">
      <span />
      <span className="eyebrow">Course</span>
      <span className="eyebrow text-right">Lessons</span>
      <span className="eyebrow text-right">Runtime</span>
      <span className="eyebrow text-right">Enrolled</span>
    </div>

    {courses.map((course) => (
      <Link
        key={course._id}
        href={`/courses/${course._id}`}
        className="grid grid-cols-[96px_1fr] items-center gap-4 border-b border-hairline px-4 py-3 last:border-b-0 hover:bg-surface md:grid-cols-[96px_1fr_92px_92px_84px]"
      >
        <span className="relative aspect-video overflow-hidden rounded-field bg-base-300">
          <Image
            src={course.thumbnailUrl}
            alt=""
            fill
            sizes="96px"
            className="object-cover"
          />
        </span>

        <span className="min-w-0">
          <span className="card-heading line-clamp-2 block">
            {course.title}
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-base-content/60">
            {languageLabel(course.language) && (
              <span className="rounded-selector border border-hairline px-1.5">
                {languageLabel(course.language)}
              </span>
            )}
            {/* The columns are hidden on small screens, so the same figures
                appear inline there instead of disappearing */}
            <span className="figure-text md:hidden">
              <FaVideo size={10} className="mr-1 inline" />
              {course.totalCount}
            </span>
            {course.totalDurationSeconds > 0 && (
              <span className="figure-text md:hidden">
                <FaRegClock size={10} className="mr-1 inline" />
                {formatDuration(course.totalDurationSeconds)}
              </span>
            )}
          </span>
        </span>

        <span className="figure-text hidden text-right text-sm md:block">
          {course.totalCount}
        </span>
        <span className="figure-text hidden text-right text-sm md:block">
          {course.totalDurationSeconds > 0
            ? formatDuration(course.totalDurationSeconds)
            : "—"}
        </span>
        <span className="figure-text hidden text-right text-sm text-base-content/60 md:block">
          {course.enrollCount ?? 0}
        </span>
      </Link>
    ))}
  </div>
);

export default CourseTable;
