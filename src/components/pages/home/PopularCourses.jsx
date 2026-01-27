"use client";
import PlaylistCard from "@/components/ui/PlaylistCard";
import PlaylistCardSkeleton from "@/components/ui/PlaylistCardSkeleton";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { GrLinkNext } from "react-icons/gr";

const PopularCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchPopularCourses = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          "/api/courses?approved=true&popular=true&limit=8",
        );
        const data = await res.json();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching popular courses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPopularCourses();
  }, []);

  return (
    <>
      <h2 className="my-4">Popular Courses {courses.length}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading && (
          <>
            {Array.from({ length: 8 }).map((_, i) => (
              <PlaylistCardSkeleton key={i} />
            ))}
          </>
        )}
        {!loading &&
          courses.map((course) => (
            <PlaylistCard key={course._id} playlist={course} />
          ))}
      </div>
      <div className="text-center">
        <Link href="/courses/" className="btn btn-primary mt-4">
          More Courses <GrLinkNext />
        </Link>
      </div>
    </>
  );
};

export default PopularCourses;
