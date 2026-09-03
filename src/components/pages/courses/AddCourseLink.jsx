"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { FaPlus } from "react-icons/fa6";

// Client island: keeps the courses page renderable without reading the session
const AddCourseLink = () => {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <Link
      className="text-primary flex items-center gap-1 btn btn-primary btn-sm"
      href="/profile/courses/add"
    >
      <FaPlus className="mb-0.5" />
      Add
    </Link>
  );
};

export default AddCourseLink;
