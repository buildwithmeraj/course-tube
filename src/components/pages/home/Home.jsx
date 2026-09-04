import Link from "next/link";
import { FaGraduationCap, FaVideo, FaRegClock, FaFolderOpen } from "react-icons/fa6";
import { HiUserGroup } from "react-icons/hi";
import PlaylistCard from "@/components/ui/PlaylistCard";
import StatTile from "@/components/ui/StatTile";
import ContinueLearning from "@/components/ui/ContinueLearning";
import { listCourses, listCategories, getPlatformStats, toPlain } from "@/lib/queries";
import { formatDuration } from "@/lib/duration";

// The home page is a dashboard, not a landing page: what you were watching and
// what the library holds, before anything else.
export default async function HomePage() {
  const [stats, courses, categories] = await Promise.all([
    getPlatformStats(),
    listCourses({ filter: { approved: true }, sortBy: "enrollCount", limit: 10 }).then(toPlain),
    listCategories().then(toPlain),
  ]);

  return (
    <div className="space-y-8">
      <ContinueLearning />

      <section>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h1 className="page-title mb-0">Library</h1>
          <span className="figure-text text-xs text-base-content/60">
            {stats.coursesCount ?? 0} courses · {formatDuration(stats.totalVideoDurationSeconds || 0)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile
            label="Courses"
            value={stats.coursesCount ?? 0}
            hint="published and approved"
            icon={FaGraduationCap}
          />
          <StatTile
            label="Lessons"
            value={(stats.videosCount ?? 0).toLocaleString()}
            hint="chaptered and tracked"
            icon={FaVideo}
          />
          <StatTile
            label="Runtime"
            value={formatDuration(stats.totalVideoDurationSeconds || 0)}
            hint="across the whole library"
            icon={FaRegClock}
          />
          <StatTile
            label="Enrolments"
            value={stats.enrollsCount ?? 0}
            hint={`${stats.categoriesCount ?? 0} categories`}
            icon={HiUserGroup}
          />
        </div>
      </section>

      {categories.length > 0 && (
        <section>
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="section-title mb-0">Categories</h2>
            <Link href="/categories" className="text-xs text-primary hover:underline">
              All {categories.length} →
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 8).map((category) => (
              <Link
                key={category._id}
                href={`/categories/${category._id}`}
                className="flex items-center gap-2 rounded-field border border-hairline bg-base-100 px-3 py-1.5 text-sm hover:border-primary hover:text-primary"
              >
                <FaFolderOpen size={12} className="text-base-content/40" />
                {category.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="section-title mb-0">Most enrolled</h2>
          <Link href="/courses" className="text-xs text-primary hover:underline">
            Browse all →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {courses.map((course) => (
            <PlaylistCard key={course._id} playlist={course} />
          ))}
        </div>
      </section>
    </div>
  );
}
