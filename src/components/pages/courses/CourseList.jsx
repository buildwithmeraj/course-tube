"use client";
import PlaylistCard from "@/components/ui/PlaylistCard";
import PlaylistCardSkeleton from "@/components/ui/PlaylistCardSkeleton";
import { useEffect, useState } from "react";

const CoursesList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("");

  useEffect(() => {
    const fetchAllCourses = async () => {
      try {
        setLoading(true);
        let url = "/api/courses?approved=true";
        if (sortBy) {
          url += `&sortBy=${sortBy}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllCourses();
  }, [sortBy]);

  const handleFilterChange = (e) => {
    setSortBy(e.target.value);
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <h2 className="-mb-3">All Courses</h2>
        <div>
          <select
            value={sortBy}
            onChange={handleFilterChange}
            className="select"
          >
            <option value="">No Filter</option>
            <option value="enrollCount">Total Enrolls</option>
            <option value="totalCount">Total Videos</option>
            <option value="createdAt">Added Recently</option>
            <option value="updatedAt">Updated Recently</option>
          </select>
        </div>
      </div>

      {courses.length === 0 && <p>No approved courses</p>}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        {loading && (
          <>
            {Array.from({ length: 12 }).map((_, i) => (
              <PlaylistCardSkeleton key={i} />
            ))}
          </>
        )}
        {courses.map((item) => (
          <PlaylistCard key={item._id.toString()} playlist={item} />
        ))}
      </div>
    </div>
  );
};

export default CoursesList;
