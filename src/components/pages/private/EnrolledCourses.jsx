import getUserPlaylist from "@/actions/server/getUserPlaylist";
import PlaylistCard from "@/components/ui/PlaylistCard";
import PlaylistCardSkeleton from "@/components/ui/PlaylistCardSkeleton";
import { Suspense } from "react";

const EnrolledCourses = async () => {
  const courses = await getUserPlaylist();
  return (
    <div>
      <h1>Your Courses</h1>

      {courses.length === 0 && <p>No enrolled courses</p>}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        <Suspense
          fallback={
            <>
              {Array.from({ length: 12 }).map((_, i) => (
                <PlaylistCardSkeleton key={i} />
              ))}
            </>
          }
        >
          {courses.map((item) => (
            <PlaylistCard key={item._id.toString()} playlist={item.course} />
          ))}
        </Suspense>
      </div>
    </div>
  );
};

export default EnrolledCourses;
