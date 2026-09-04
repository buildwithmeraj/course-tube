import Link from "next/link";
import { FaRegClock, FaVideo } from "react-icons/fa6";
import { listCourses, toPlain } from "@/lib/queries";
import { isValidLanguage } from "@/lib/languages";
import CourseTable from "@/components/ui/CourseTable";
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
        <CourseTable courses={courses} />
      )}
    </div>
  );
};

export default CoursesList;
