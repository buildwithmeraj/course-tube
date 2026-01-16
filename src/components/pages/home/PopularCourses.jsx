"use client";
import LoadingInBlock from "@/components/ui/LoadingInBlock";
import PlaylistCard from "@/components/ui/PlaylistCard";
import React, { useEffect, useState } from "react";

const PopularCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchPopularCourses = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          "/api/courses?approved=true&popular=true&limit=8"
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

  if (loading) {
    return <LoadingInBlock />;
  }
  return (
    <>
      <h2>Popular Courses {courses.length}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {courses.map((course) => (
          <PlaylistCard key={course._id} playlist={course} />
        ))}
      </div>
    </>
  );
};

export default PopularCourses;
