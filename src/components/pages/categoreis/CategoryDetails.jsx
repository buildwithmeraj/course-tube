import PlaylistCard from "@/components/ui/PlaylistCard";
import React from "react";
import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import { FaCircleInfo } from "react-icons/fa6";
import { getCategory, toPlain } from "@/lib/queries";

const CategoryDetails = async ({ id }) => {
  if (!ObjectId.isValid(id)) notFound();

  const category = toPlain(await getCategory(new ObjectId(id)));

  if (!category) notFound();

  const courses = category.courses || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-4 mt-4">
      <h1 className="col-span-full page-title">
        {category.title} ({courses.length} Courses)
      </h1>
      {category.description && (
        <p className="col-span-full alert alert-soft alert-info">
          <FaCircleInfo className="inline -mr-2.5 mb-0.5" />
          {category.description}
        </p>
      )}
      {courses.map((item) => (
        <PlaylistCard key={item._id} playlist={item} />
      ))}
    </div>
  );
};

export default CategoryDetails;
