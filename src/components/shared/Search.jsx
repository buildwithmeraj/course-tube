import Link from "next/link";
import React, { useState, useEffect } from "react";
import { IoSearch } from "react-icons/io5";
import { RiPlayList2Fill } from "react-icons/ri";

const Search = ({ setShowSearchModal }) => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);

  // fetch searched courses
  const fetchCourses = async () => {
    if (!debouncedQuery) return;
    setError(null);
    setLoading(true);

    const courseRes = await fetch(`/api/courses?q=${debouncedQuery}`);
    if (!courseRes.ok) {
      setError("Couldn't fetch courses");
      setLoading(false);
      return;
    }

    const courseData = await courseRes.json();
    setCourses(courseData);
    setLoading(false);
  };

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  // Runs only after debounce delay
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCourses();
    }, 0);
    return () => clearTimeout(timer);
  }, [debouncedQuery]);

  return (
    <dialog className="modal modal-open">
      <div className="modal-box space-y-3">
        <h3 className="text-center font-semibold text-xl">Search Courses</h3>
        <div className="min-h-[10vh]">
          <p className="text-center">
            <label className="input">
              <IoSearch />
              <input
                type="search"
                placeholder="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
          </p>
          {error && <>{error}</>}
          {!loading && debouncedQuery && (
            <div className="text-center font-semibold my-3">
              {courses.length === 0
                ? "No results found"
                : `Search Result ${courses.length}`}
            </div>
          )}
          {loading && (
            <div>
              <div className="flex justify-center my-3">
                <div className="skeleton h-4 w-32"></div>
              </div>
              <div className="skeleton h-4 w-72 mb-2"></div>
              <div className="divider m-0"></div>
              <div className="skeleton h-4 w-56 mb-2"></div>
              <div className="divider m-0"></div>
              <div className="skeleton h-4 w-60 mb-2"></div>
              <div className="divider m-0"></div>
              <div className="skeleton h-4 w-58 mb-2"></div>
              <div className="divider m-0"></div>
              <div className="skeleton h-4 w-68"></div>
            </div>
          )}

          {!loading && debouncedQuery && courses?.length > 0 && (
            <div className="flex flex-col">
              {courses.map((course) => (
                <div key={course._id}>
                  <Link
                    href={`/courses/${course._id}`}
                    onClick={() => setShowSearchModal(false)}
                    className="hover:link truncate flex items-center"
                  >
                    <RiPlayList2Fill className="mr-2" size={14} />
                    {course.title}
                  </Link>
                  <div className="divider m-0"></div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="modal-action justify-center">
          <form method="dialog">
            <button
              className="btn btn-soft"
              onClick={() => setShowSearchModal(false)}
            >
              Close
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
};

export default Search;
