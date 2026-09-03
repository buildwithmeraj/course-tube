"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { FaFolderPlus } from "react-icons/fa6";

// Kept as a client island so the categories page can stay statically rendered
// instead of going dynamic just to read the session.
const AddCategoryLink = () => {
  const { data: session } = useSession();

  if (session?.user?.role !== "admin") return null;

  return (
    <Link
      className="border-t border-base-content/30 mt-2 pt-2 hover:text-primary flex items-center justify-center"
      href="/dashboard/categories/add"
    >
      <FaFolderPlus className="inline mr-2 mb-1" size={18} />
      Add a Category
    </Link>
  );
};

export default AddCategoryLink;
