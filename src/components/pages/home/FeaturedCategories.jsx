"use client";
import Loading from "@/components/ui/Loading";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FaFolder, FaFolderOpen } from "react-icons/fa6";
import { GrLinkNext } from "react-icons/gr";

const FeaturedCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");

        const data = await res.json();
        setCategories(data.reverse());
        if (categories.length > 4) {
          setCategories(categories.splice(4));
        }
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
        <div className="p-2 bg-base-200 border border-base-content/30 rounded-xl backdrop-blur-lg mt-6">
          <h2 className="-mb-2 text-center">Featured Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 justify-items-center mt-3 p-2 rounded-lg">
            {categories.map((category) => (
              <Link
                key={category._id}
                className="hover:text-primary bg-base-300 py-2 px-4 rounded-lg"
                href={`/categories/${category._id}`}
              >
                <FaFolderOpen className="inline mr-2 mb-1" size={18} />
                {category.title}
              </Link>
            ))}
          </div>
          <div className="text-center">
            <Link href="/categories/" className="btn btn-primary my-4">
              <FaFolder />
              All Categories
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export default FeaturedCategories;
