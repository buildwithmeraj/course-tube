"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { RxResume } from "react-icons/rx";
import { RiPlayListLine } from "react-icons/ri";

// Personalised, so this stays a client island: the pages that host it remain
// statically cached and this fills itself in after hydration.
const ContinueLearning = () => {
  const { status } = useSession();
  const [resume, setResume] = useState(null);

  useEffect(() => {
    if (status !== "authenticated") return;

    let cancelled = false;

    fetch("/api/progress/latest")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setResume(data?.resume ?? null);
      })
      .catch(() => {
        if (!cancelled) setResume(null);
      });

    return () => {
      cancelled = true;
    };
  }, [status]);

  if (status !== "authenticated" || !resume) return null;

  const percent =
    resume.totalCount > 0
      ? Math.min(100, Math.round((resume.completedCount / resume.totalCount) * 100))
      : 0;

  return (
    <section className="rounded-box border border-hairline bg-base-100 p-4">
      <p className="eyebrow mb-3">Continue where you left off</p>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {resume.thumbnailUrl && (
          <Link
            href={`/courses/${resume.courseId}/videos?video=${resume.videoId}`}
            className="shrink-0"
          >
            <Image
              src={resume.thumbnailUrl}
              alt={resume.videoTitle}
              width={160}
              height={90}
              className="h-[90px] w-[160px] rounded-lg object-cover"
            />
          </Link>
        )}

        <div className="min-w-0 flex-1">
          <Link
            href={`/courses/${resume.courseId}`}
            className="flex items-center gap-1.5 text-xs text-base-content/60 hover:text-primary"
          >
            <RiPlayListLine size={13} />
            <span className="truncate">{resume.courseTitle}</span>
          </Link>

          <h3 className="mt-1 line-clamp-2 font-semibold">
            <Link
              href={`/courses/${resume.courseId}/videos?video=${resume.videoId}`}
              className="hover:text-primary"
            >
              {resume.videoTitle}
            </Link>
          </h3>

          <div className="mt-2 flex items-center gap-2">
            {/* Amber, not green: this card only ever shows a course you have
                not finished, and green is reserved for finished. */}
            <progress
              className="progress progress-accent w-40"
              value={resume.completedCount}
              max={resume.totalCount || 1}
            />
            <span className="text-xs text-base-content/60">
              {resume.completedCount}/{resume.totalCount} · {percent}%
            </span>
          </div>
        </div>

        <Link
          href={`/courses/${resume.courseId}/videos?video=${resume.videoId}`}
          className="btn btn-primary sm:self-center"
        >
          <RxResume />
          Resume
        </Link>
      </div>
    </section>
  );
};

export default ContinueLearning;
