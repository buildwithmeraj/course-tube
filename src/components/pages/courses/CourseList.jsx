import Image from "next/image";
import Link from "next/link";
import { FaRegClock, FaVideo } from "react-icons/fa6";
import { listCourses, toPlain } from "@/lib/queries";
import { isValidLanguage, languageLabel } from "@/lib/languages";
import { formatDuration } from "@/lib/duration";
import AddCourseLink from "./AddCourseLink";
import CourseSortSelect from "./CourseSortSelect";
import CourseLanguageSelect from "./CourseLanguageSelect";

// A table rather than a card grid: the point of this page is comparing
// courses, and runtimes and lesson counts only compare when they line up in a
// column. The art stays, just smaller.
const CoursesList = async ({ sortBy, language }) => {
  const filter = { approved: true };
  if (isValidLanguage(language)) filter.language = language;

  const courses = toPlain(await listCourses({ filter, sortBy }));

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title mb-0">All courses</h1>
          <p className="figure-text mt-1 text-xs text-base-content/60">
            {courses.length} course{courses.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CourseLanguageSelect />
          <CourseSortSelect />
          <AddCourseLink />
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-box border border-hairline bg-base-100 p-10 text-center">
          <p className="font-semibold">No courses match this filter.</p>
          <p className="mt-1 text-sm text-base-content/60">
            Try a different language, or clear the filter.
          </p>
        </div>
      ) : (
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
      )}
    </div>
  );
};

export default CoursesList;
