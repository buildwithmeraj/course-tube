import Link from "next/link";
import React from "react";
import { FaFolderOpen } from "react-icons/fa6";
import { listCategories, toPlain } from "@/lib/queries";
import AddCategoryLink from "./AddCategoryLink";

const CategoryList = async () => {
  const categories = toPlain(await listCategories());

  if (categories.length === 0) return null;

  return (
    <div className="flex flex-col gap-0.5 max-w-lg mx-auto border p-2 border-base-content/30 rounded-xl mt-1">
      <h1 className="page-title text-accent text-center">Categories</h1>
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
      <AddCategoryLink />
    </div>
  );
};

export default CategoryList;
