import PlaylistCard from "@/components/ui/PlaylistCard";
import Link from "next/link";
import React from "react";
import { GrLinkNext } from "react-icons/gr";
import { listCourses, toPlain } from "@/lib/queries";

const PopularCourses = async () => {
  const courses = toPlain(
    await listCourses({
      filter: { approved: true },
      sortBy: "enrollCount",
      limit: 8,
    }),
  );

  return (
    <>
      <div className="text-center mb-4">
        <h2 className="section-title text-center">Popular Courses</h2>
        <p className="text-base-content/70">
          Start with the courses other learners are watching and completing
          right now.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
        {courses.map((course) => (
          <PlaylistCard key={course._id} playlist={course} />
        ))}
      </div>
      <div className="text-center">
        <Link href="/courses/" className="btn btn-primary mt-4">
          Browse All Courses <GrLinkNext />
        </Link>
      </div>
    </>
  );
};

export default PopularCourses;
