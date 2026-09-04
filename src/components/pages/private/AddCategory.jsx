"use client";
import React, { useEffect, useMemo, useState } from "react";
import { FaCircleCheck, FaFolderPlus } from "react-icons/fa6";
import { IoWarning } from "react-icons/io5";
import FormPanel from "@/components/ui/FormPanel";

const AddCategory = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch approved courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        const res = await fetch("/api/courses?approved=true");
        const data = await res.json();
        setCourses(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load courses");
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  const toggleCourse = (courseId) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId],
    );
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (selectedCourses.length === 0) {
      setError("Select at least one course");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          courseIds: selectedCourses,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess("Category added successfully");
      setTitle("");
      setDescription("");
      setSelectedCourses([]);
      setCourseSearch("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCourses = useMemo(() => {
    if (!courseSearch.trim()) return courses;

    return courses.filter((course) =>
      course.title.toLowerCase().includes(courseSearch.toLowerCase()),
    );
  }, [courses, courseSearch]);

  return (
    <FormPanel title="Add a category" description="Group related courses under one topic." width="md">
      <form className="space-y-3" onSubmit={handleAddCategory}>

          {error && (
            <p className="alert alert-error">
              <IoWarning className="inline" />
              {error}
            </p>
          )}
          {success && (
            <p className="alert alert-success">
              <FaCircleCheck className="inline" />
              {success}
            </p>
          )}

          <div>
            <label className="eyebrow">Category Title</label>
            <input
              className="input input-bordered w-full"
              value={title}
              type="text"
              onChange={(e) => setTitle(e.target.value)}
              placeholder="MERN Stack"
            />
          </div>

          <div>
            <label className="eyebrow">Description</label>
            <textarea
              className="textarea textarea-bordered w-full"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>

          <div>
            <label className="eyebrow">Select Courses</label>

            <input
              type="text"
              className="input input-sm input-bordered w-full mb-2"
              placeholder="Search courses..."
              value={courseSearch}
              onChange={(e) => setCourseSearch(e.target.value)}
            />

            <div className="max-h-40 overflow-y-auto space-y-1 border p-2 rounded-box">
              {loadingCourses ? (
                <p className="text-sm opacity-70">Loading courses...</p>
              ) : filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <label
                    key={course._id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={selectedCourses.includes(course._id)}
                      onChange={() => toggleCourse(course._id)}
                    />
                    <span className="truncate">{course.title}</span>
                  </label>
                ))
              ) : (
                <p className="text-sm opacity-60">No matching courses</p>
              )}
            </div>
          </div>

          <button className="btn btn-primary mt-3" disabled={submitting}>
            <FaFolderPlus size={16} />
            {submitting ? "Adding…" : "Add category"}
          </button>
      </form>
    </FormPanel>
  );
};

export default AddCategory;
