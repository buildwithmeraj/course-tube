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
      <div className="flex justify-between items-center">
        <h2 className="title-accent -mb-3">All Courses</h2>
        <div className="flex gap-2">
          <CourseLanguageSelect />
          <CourseSortSelect />
        </div>
        <AddCourseLink />
      </div>

      {courses.length === 0 && (
        <p className="mt-4">No courses match this filter.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {courses.map((item) => (
          <PlaylistCard key={item._id} playlist={item} />
        ))}
      </div>
    </div>
  );
};

export default CoursesList;
