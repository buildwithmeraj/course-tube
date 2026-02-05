"use client";
import Loading from "@/components/ui/Loading";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FaSignOutAlt } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { RiGraduationCapFill } from "react-icons/ri";
import { RxResume } from "react-icons/rx";

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.user ?? {};
  const displayName = user?.name || user?.email?.split("@")?.[0] || "Learner";
  const role = user?.role || "student";
  const email = user?.email || "Not provided";
  const [stats, setStats] = useState(null);
  const statsLoading =
    status === "loading" || (session?.user?.email && stats === null);
  const [ongoingCourses, setOngoingCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const normalizeCourseId = (courseId) => {
    if (!courseId) return "";
    if (typeof courseId === "string") return courseId;
    if (typeof courseId === "object" && courseId.$oid) return courseId.$oid;
    if (typeof courseId?.toString === "function") return courseId.toString();
    return "";
  };

  useEffect(() => {
    if (!session?.user?.email) return;

    let cancelled = false;

    fetch(`/api/stats/${session.user.email}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setStats(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          console.error("Error fetching stats");
          setStats({
            enrolledCount: 0,
            completedCount: 0,
            inProgressCount: 0,
            courses: [],
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [session?.user?.email]);

  const enrolledStats = useMemo(() => {
    const enrolled = Number(stats?.enrolledCount || 0);
    const completed = Number(stats?.completedCount || 0);
    const inProgress = Number(stats?.inProgressCount || 0);
    const progress =
      enrolled > 0 ? Math.round((completed / enrolled) * 100) : 0;
    return { enrolled, completed, inProgress, progress };
  }, [stats]);
  const progressLabel = statsLoading
    ? "Loading..."
    : `${enrolledStats.progress}%`;

  useEffect(() => {
    if (!stats?.courses) {
      setOngoingCourses([]);
      setCoursesLoading(false);
      return;
    }

    const ongoingIds = stats.courses
      .filter((course) => !course?.completed)
      .map((course) => normalizeCourseId(course?.courseId))
      .filter(Boolean);

    if (ongoingIds.length === 0) {
      setOngoingCourses([]);
      setCoursesLoading(false);
      return;
    }

    let cancelled = false;
    setCoursesLoading(true);
    Promise.all(
      ongoingIds.map((courseId) =>
        fetch(`/api/courses/${courseId}`)
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null),
      ),
    )
      .then((courses) => {
        if (!cancelled) {
          setOngoingCourses(courses.filter(Boolean));
        }
      })
      .finally(() => {
        if (!cancelled) setCoursesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [stats]);

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: "/" });
    router.push("/");
  };

  if (status === "loading") {
    return <Loading />;
  }

  return (
    <section className="mx-auto max-w-5xl">
      <div className="rounded-2xl border border-base-200 bg-base-100 p-6 shadow-md md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative">
              {user?.image ? (
                <Image
                  src={user.image}
                  alt={`${displayName} profile photo`}
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-full border-4 border-base-100 object-cover shadow-md"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-content shadow-md">
                  {displayName.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-base-content">
                {displayName}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-base-200 bg-base-200/60 px-3 py-1 text-xs font-semibold text-base-content">
                  {role}
                </span>
                <span className="rounded-full border border-base-200 bg-base-200/40 px-3 py-1 text-xs font-semibold text-base-content/70">
                  {email}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link href="/profile/courses" className="btn btn-sm btn-accent">
              <RiGraduationCapFill className="mb-0.5" />
              View Courses
            </Link>
            {user?.role === "admin" && (
              <Link href="/dashboard" className="btn btn-sm btn-info">
                <MdDashboard />
                Admin Dashboard
              </Link>
            )}
            <button onClick={handleSignOut} className="btn btn-sm btn-error">
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-base-200 bg-base-200 p-5 shadow-sm">
            <p className="text-sm font-medium text-base-content/60">
              Enrolled course progress
            </p>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-semibold text-base-content">
                {progressLabel}
              </span>
              <span className="text-xs text-base-content/60">
                {statsLoading
                  ? "Fetching progress"
                  : `${enrolledStats.inProgress} active courses`}
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-base-200/70">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${statsLoading ? 0 : enrolledStats.progress}%`,
                }}
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
              <div className="rounded-lg bg-base-200/50 px-2 py-3">
                <p className="text-xs text-base-content/60">Enrolled</p>
                <p className="mt-1 text-lg font-semibold text-base-content">
                  {statsLoading ? "--" : enrolledStats.enrolled}
                </p>
              </div>
              <div className="rounded-lg bg-base-200/50 px-2 py-3">
                <p className="text-xs text-base-content/60">In progress</p>
                <p className="mt-1 text-lg font-semibold text-base-content">
                  {statsLoading ? "--" : enrolledStats.inProgress}
                </p>
              </div>
              <div className="rounded-lg bg-base-200/50 px-2 py-3">
                <p className="text-xs text-base-content/60">Completed</p>
                <p className="mt-1 text-lg font-semibold text-base-content">
                  {statsLoading ? "--" : enrolledStats.completed}
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm text-base-content/60">
              Keep moving to finish the courses you have started.
            </p>
          </div>

          <div className="rounded-xl border border-base-200 bg-base-200 p-5 shadow-sm">
            <p className="text-sm font-medium text-base-content/60">
              Account details
            </p>
            <div className="mt-4 space-y-3 text-sm text-base-content/70">
              <div className="flex items-center justify-between">
                <span className="text-base-content/60">Email</span>
                <span className="font-medium text-base-content">{email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base-content/60">Role</span>
                <span className="font-medium capitalize text-base-content">
                  {role}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base-content/60">Status</span>
                <span className="rounded-full bg-success/15 px-2 py-1 text-xs font-semibold text-success">
                  Active
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-base-200 bg-base-200 p-5 shadow-sm md:col-span-2 lg:col-span-1">
            <p className="text-sm font-medium text-base-content/60">
              Next steps
            </p>
            <p className="mt-3 text-lg font-semibold text-base-content">
              Keep your learning momentum going.
            </p>
            <p className="mt-2 text-sm text-base-content/60">
              Head to your courses to pick up where you left off or discover
              something new.
            </p>
            <div className="text-center">
              <Link href="/profile/courses" className="btn btn-accent mt-4">
                <RxResume />
                Continue learning
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-base-200 bg-base-100 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-base-content">
            Ongoing courses
          </h3>
          <Link href="/profile/courses" className="text-sm font-medium link">
            View all
          </Link>
        </div>

        {coursesLoading ? (
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`course-skeleton-${index}`}
                className="h-16 rounded-lg bg-base-200/90"
              />
            ))}
          </div>
        ) : ongoingCourses.length === 0 ? (
          <p className="mt-4 text-sm text-base-content/60">
            No ongoing courses yet. Enroll in a course to start learning.
          </p>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {ongoingCourses.map((course) => {
              const courseId = normalizeCourseId(course?._id);
              return (
                <div
                  key={courseId || course?.title}
                  className="flex items-center gap-3 rounded-lg border border-base-300 bg-base-300 p-3"
                >
                  <div className="h-12 w-18 overflow-hidden rounded-md bg-base-200/60">
                    {course?.thumbnailUrl ? (
                      <Image
                        src={course.thumbnailUrl}
                        alt={course?.title || "Course"}
                        width={80}
                        height={50}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-base-content/60">
                        Course
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-base-content line-clamp-2">
                      {course?.title || "Untitled course"}
                    </p>
                    <p className="text-xs text-base-content/60">
                      {course?.totalCount
                        ? `${course.totalCount} videos`
                        : "Progress syncing"}
                    </p>
                  </div>
                  {courseId && (
                    <Link
                      href={`/courses/${courseId}/videos`}
                      className="py-1 px-2 border border-base-content/50 rounded-full"
                    >
                      Resume
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
