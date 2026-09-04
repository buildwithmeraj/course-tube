import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FaRegClock, FaVideo } from "react-icons/fa6";
import { listCategories, toPlain } from "@/lib/queries";
import { formatDuration } from "@/lib/duration";
import AddCategoryLink from "./AddCategoryLink";

// A category is worth opening or it isn't, and that depends on what is inside
// it — so each card carries its course count, total runtime and a strip of the
// art it holds, rather than being a bare line of text.
const CategoryList = async () => {
  const categories = toPlain(await listCategories());

  if (categories.length === 0) {
    return (
      <div>
        <h1 className="page-title">Categories</h1>
        <div className="rounded-box border border-hairline bg-base-100 p-10 text-center">
          <p className="font-semibold">No categories yet.</p>
          <p className="mt-1 text-sm text-base-content/60">
            Categories group courses by topic.
          </p>
          <div className="mt-4">
            <AddCategoryLink />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title mb-0">Categories</h1>
          <p className="figure-text mt-1 text-xs text-base-content/60">
            {categories.length} topic{categories.length === 1 ? "" : "s"}
          </p>
        </div>
        <AddCategoryLink />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {categories.map((category) => {
          const courses = category.courses || [];
          const lessons = courses.reduce(
            (sum, c) => sum + (Number(c.totalCount) || 0),
            0,
          );
          const seconds = courses.reduce(
            (sum, c) => sum + (Number(c.totalDurationSeconds) || 0),
            0,
          );

          return (
            <Link
              key={category._id}
              href={`/categories/${category._id}`}
              className="group flex flex-col overflow-hidden rounded-box border border-hairline bg-base-100 transition-colors hover:border-primary/50"
            >
              {/* Fixed-height strip so every card's title sits on the same
                  line; the art inside shares the width, however much there is. */}
              <div
                className="grid h-24 gap-px bg-hairline"
                style={{
                  gridTemplateColumns: `repeat(${Math.min(courses.length, 3) || 1}, minmax(0, 1fr))`,
                }}
              >
                {courses.length === 0 ? (
                  <span className="bg-base-200" />
                ) : (
                  courses.slice(0, 3).map((course) => (
                    <span key={course._id} className="relative bg-base-300">
                      <Image
                        src={course.thumbnailUrl}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 50vw, 220px"
                        className="object-cover"
                      />
                    </span>
                  ))
                )}
              </div>

              <div className="flex flex-1 flex-col p-4">
                <h2 className="card-heading group-hover:text-primary">
                  {category.title}
                </h2>
                {category.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-base-content/60">
                    {category.description}
                  </p>
                )}
                <div className="figure-text mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-base-content/60">
                  <span>
                    {courses.length} course{courses.length === 1 ? "" : "s"}
                  </span>
                  {lessons > 0 && (
                    <span className="flex items-center gap-1">
                      <FaVideo size={10} />
                      {lessons}
                    </span>
                  )}
                  {seconds > 0 && (
                    <span className="flex items-center gap-1">
                      <FaRegClock size={10} />
                      {formatDuration(seconds)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryList;
