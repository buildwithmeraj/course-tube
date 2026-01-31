"use client";
import Loading from "@/components/ui/Loading";
import PlaylistCard from "@/components/ui/PlaylistCard";
import PlaylistCardSkeleton from "@/components/ui/PlaylistCardSkeleton";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const CategoryDetails = () => {
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        let url = `/api/categories/${id}`;
        const res = await fetch(url);
        const data = await res.json();
        setCategory(data);
      } catch (error) {
        setError("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [id]);
  if (error) console.log(error);
  if (loading) return <Loading />;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
      <h2 className="col-span-full">
        {category.title} ({category.courses.length} Courses)
      </h2>
      {loading && (
        <>
          {Array.from({ length: 12 }).map((_, i) => (
            <PlaylistCardSkeleton key={i} />
          ))}
        </>
      )}
      {category.courses.map((item) => (
        <PlaylistCard key={item._id.toString()} playlist={item} />
      ))}
    </div>
  );
};

export default CategoryDetails;
