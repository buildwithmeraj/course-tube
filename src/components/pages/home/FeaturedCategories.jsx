import Link from "next/link";
import React from "react";
import { FaFolder, FaFolderOpen } from "react-icons/fa6";
import { listCategories, toPlain } from "@/lib/queries";

const FeaturedCategories = async () => {
  const categories = toPlain(await listCategories()).slice(0, 4);

  return categories.length > 0 ? (
    <section className="mt-8">
      <div className="rounded-2xl border border-base-200 bg-base-100 p-6 shadow-sm">
        <h2 className="text-center">Featured Categories</h2>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="mt-1 text-sm text-base-content/60">
            Jump into a topic and find playlists that match what you want to
            learn next.
          </p>
          <Link href="/categories/" className="btn btn-soft">
            <FaFolder className="mb-0.5" />
            All Categories
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
              <Link
                key={category._id}
                href={`/categories/${category._id}`}
                className="group relative overflow-hidden rounded-xl border border-base-300 bg-base-200 p-4 transition hover:-translate-y-1 hover:border-base-300 hover:shadow-md"
              >
                <div>
                  <FaFolderOpen size={18} className="inline mb-0.5 mr-0.5" />{" "}
                  <span className="text-sm font-semibold text-base-content">
                    {category.title}
                  </span>
                </div>
              </Link>
          ))}
        </div>
      </div>
    </section>
  ) : null;
};

export default FeaturedCategories;
