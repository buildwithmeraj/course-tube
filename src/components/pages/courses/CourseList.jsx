import PlaylistCard from "@/components/ui/PlaylistCard";
import { listApprovedCourses, toPlain } from "@/lib/queries";
import AddCourseLink from "./AddCourseLink";
import CourseSortSelect from "./CourseSortSelect";

const CoursesList = async ({ sortBy }) => {
  const courses = toPlain(await listApprovedCourses({ sortBy }));

  return (
    <div>
      <div className="flex justify-between items-center">
        <h2 className="title-accent -mb-3">All Courses</h2>
        <div>
          <CourseSortSelect />
        </div>
        <AddCourseLink />
      </div>

      {courses.length === 0 && <p>No approved courses</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {courses.map((item) => (
          <PlaylistCard key={item._id} playlist={item} />
        ))}
      </div>
    </div>
  );
};

export default CoursesList;
