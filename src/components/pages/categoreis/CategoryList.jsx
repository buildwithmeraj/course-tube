"use client";
import Loading from "@/components/ui/Loading";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FaFolderOpen, FaFolderPlus } from "react-icons/fa6";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");

        const data = await res.json();
        setCategories(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);
  if (error) console.log(error);
  if (loading) return <Loading />;

  return (
    <>
      {categories.length > 0 && (
        <div className="flex flex-col gap-0.5 max-w-lg mx-auto border p-2 border-base-content/30 rounded-xl mt-1 backdrop-blur-lg">
          <h2 className="-mb-2 text-center">Categories</h2>
          {categories.map((category) => (
            <Link
              key={category._id}
              className="border-t border-base-content/30 mt-2 pt-2 hover:text-primary"
              href={`/categories/${category._id}`}
            >
              <FaFolderOpen className="inline mr-2 mb-1" size={18} />
              {category.title}
            </Link>
          ))}
          {session?.user?.role === "admin" && (
            <Link
              className="border-t border-base-content/30 mt-2 pt-2 hover:text-primary flex items-center justify-center"
              href="/dashboard/categories/add"
            >
              <FaFolderPlus className="inline mr-2 mb-1" size={18} />
              Add a Category
            </Link>
          )}
        </div>
      )}
    </>
  );
};

export default CategoryList;
