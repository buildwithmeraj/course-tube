import getUserPlaylist from "@/actions/server/getUserPlaylist";
import PlaylistCard from "@/components/ui/PlaylistCard";
import Link from "next/link";
import { GrLinkNext } from "react-icons/gr";
import { RiPlayListAddFill } from "react-icons/ri";

const EnrolledCourses = async () => {
  const courses = await getUserPlaylist();
  return (
    <div>
      <div className="flex justify-between gap-4 flex-col lg:items-center lg:flex-row">
        <h2 className="title-accent">
          Your Courses {courses.length > 0 && `(${courses.length})`}
        </h2>
        <Link href="/profile/courses/add" className="btn btn-primary">
          <RiPlayListAddFill />
          Add
        </Link>
      </div>
      {courses.length === 0 && <p>No enrolled courses</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {courses.map((item) => (
          <PlaylistCard key={item._id.toString()} playlist={item.course} />
        ))}
      </div>
      <div className="text-center">
        <Link href="/courses/" className="btn btn-primary mt-4">
          More Courses <GrLinkNext />
        </Link>
      </div>
    </div>
  );
};

export default EnrolledCourses;
