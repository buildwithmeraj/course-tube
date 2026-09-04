"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IoSearch } from "react-icons/io5";
import PlaylistCard from "@/components/ui/PlaylistCard";
import PlaylistCardSkeleton from "@/components/ui/PlaylistCardSkeleton";

// The query lives in the URL, so a result set can be linked, bookmarked and
// reached with the back button — the modal could do none of those.
const SearchResults = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [draft, setDraft] = useState(query);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(Boolean(query));
  const [error, setError] = useState(null);

  useEffect(() => {
    setDraft(query);
  }, [query]);

  useEffect(() => {
    if (!query) {
      setCourses([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/courses?q=${encodeURIComponent(query)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("failed"))))
      .then((data) => {
        if (cancelled) return;
        setCourses(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Could not load results. Try again.");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  const submit = (event) => {
    event.preventDefault();
    const next = draft.trim();
    router.push(next ? `/search?q=${encodeURIComponent(next)}` : "/search");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title text-accent">Search</h1>
        <form onSubmit={submit} className="flex max-w-xl gap-2">
          <label className="input flex-1">
            <IoSearch size={18} className="text-base-content/60" />
            <input
              type="search"
              name="q"
              placeholder="Search courses and video titles"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              autoFocus
            />
          </label>
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <PlaylistCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && !error && query && (
        <>
          <p className="text-base-content/70">
            {courses.length === 0
              ? `Nothing matched “${query}”.`
              : `${courses.length} course${courses.length === 1 ? "" : "s"} matching “${query}”.`}
          </p>

          {courses.length === 0 ? (
            <p>
              Try a shorter phrase, or{" "}
              <Link href="/courses" className="link link-primary">
                browse all courses
              </Link>
              .
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5">
              {courses.map((course) => (
                <div key={course._id}>
                  <PlaylistCard playlist={course} />
                  {course.matchedVideos?.count > 0 && (
                    <p className="mt-1 text-xs text-base-content/60">
                      {course.matchedVideos.count} matching video
                      {course.matchedVideos.count === 1 ? "" : "s"}
                      {course.matchedVideos.titles?.[0] && (
                        <>
                          {" · "}
                          <span className="italic">
                            {course.matchedVideos.titles[0]}
                          </span>
                        </>
                      )}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!loading && !query && (
        <p className="text-base-content/70">
          Search matches course titles and the titles of the videos inside them.
        </p>
      )}
    </div>
  );
};

export default SearchResults;
