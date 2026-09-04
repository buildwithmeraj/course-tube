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
    <Link className="btn btn-primary btn-sm" href="/dashboard/categories/add">
      <FaFolderPlus size={13} />
      Add category
    </Link>
  );
};

export default AddCategoryLink;
