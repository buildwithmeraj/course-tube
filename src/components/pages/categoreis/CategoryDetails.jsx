import Link from "next/link";
import React from "react";
import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import { FaRegClock, FaVideo, FaChevronLeft } from "react-icons/fa6";
import { getCategory, toPlain } from "@/lib/queries";
import CourseTable from "@/components/ui/CourseTable";
import { formatDuration } from "@/lib/duration";

// Same table as the main catalogue, so a category reads as a filtered view of
// it rather than a different kind of page.
const CategoryDetails = async ({ id }) => {
  if (!ObjectId.isValid(id)) notFound();

  const category = toPlain(await getCategory(new ObjectId(id)));

  if (!category) notFound();

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
    <div>
      <Link
        href="/categories"
        className="mb-3 inline-flex items-center gap-1.5 text-xs text-base-content/60 hover:text-base-content"
      >
        <FaChevronLeft size={9} />
        All categories
      </Link>

      <div className="mb-4">
        <h1 className="page-title mb-1">{category.title}</h1>
        {category.description && (
          <p className="max-w-[65ch] text-sm text-base-content/70">
            {category.description}
          </p>
        )}
        <p className="figure-text mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-base-content/60">
          <span>
            {courses.length} course{courses.length === 1 ? "" : "s"}
          </span>
          {lessons > 0 && (
            <span className="flex items-center gap-1">
              <FaVideo size={10} />
              {lessons} lessons
            </span>
          )}
          {seconds > 0 && (
            <span className="flex items-center gap-1">
              <FaRegClock size={10} />
              {formatDuration(seconds)}
            </span>
          )}
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-box border border-hairline bg-base-100 p-10 text-center">
          <p className="font-semibold">Nothing in this category yet.</p>
          <Link href="/courses" className="btn btn-primary btn-sm mt-4">
            Browse all courses
          </Link>
        </div>
      ) : (
        <CourseTable courses={courses} />
      )}
    </div>
  );
};

export default CategoryDetails;
