import PlaylistCard from "@/components/ui/PlaylistCard";
import { listCourses, toPlain } from "@/lib/queries";
import AddCourseLink from "./AddCourseLink";
import CourseSortSelect from "./CourseSortSelect";
import CourseLanguageSelect from "./CourseLanguageSelect";
import { isValidLanguage } from "@/lib/languages";

const CoursesList = async ({ sortBy, language }) => {
  const filter = { approved: true };
  if (isValidLanguage(language)) filter.language = language;

  const courses = toPlain(await listCourses({ filter, sortBy }));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="page-title mb-0 text-accent">All Courses</h1>
        <div className="flex flex-wrap items-center gap-2">
          <CourseLanguageSelect />
          <CourseSortSelect />
          <AddCourseLink />
        </div>
      </div>

      {courses.length === 0 && (
        <p className="mt-4">No courses match this filter.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-4 mt-4">
        {courses.map((item) => (
          <PlaylistCard key={item._id} playlist={item} />
        ))}
      </div>
    </div>
  );
};

export default CoursesList;
