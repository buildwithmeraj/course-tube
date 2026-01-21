"use client";

import Loading from "@/components/ui/Loading";
import { useEffect, useMemo, useState } from "react";

const ACTIONS = {
  EDIT: "edit",
  DELETE: "delete",
};

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allCourses, setAllCourses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [action, setAction] = useState(null);
  const [courseSearch, setCourseSearch] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    courseIds: [],
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");

        const data = await res.json();
        setCategories(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const openEditModal = (category) => {
    setSelectedCategory(category);
    setForm({
      title: category.title,
      description: category.description || "",
      courseIds: category.courseIds || [],
    });
    setAction(ACTIONS.EDIT);
  };

  const openDeleteModal = (category) => {
    setSelectedCategory(category);
    setAction(ACTIONS.DELETE);
  };

  const closeModal = () => {
    setSelectedCategory(null);
    setAction(null);
    setForm({ title: "", description: "" });
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(`/api/categories/${selectedCategory._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Update failed");

      setCategories((prev) =>
        prev.map((cat) =>
          cat._id === selectedCategory._id ? { ...cat, ...form } : cat,
        ),
      );

      closeModal();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/categories/${selectedCategory._id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      setCategories((prev) =>
        prev.filter((cat) => cat._id !== selectedCategory._id),
      );

      closeModal();
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/courses?approved=true");
        const data = await res.json();
        setAllCourses(data);
      } catch (err) {
        console.error("Failed to fetch courses", err);
      }
    };

    fetchCourses();
  }, []);

  const toggleCourse = (courseId) => {
    setForm((prev) => ({
      ...prev,
      courseIds: prev.courseIds.includes(courseId)
        ? prev.courseIds.filter((id) => id !== courseId)
        : [...prev.courseIds, courseId],
    }));
  };

  const filteredCourses = useMemo(() => {
    if (!courseSearch.trim()) return allCourses;

    return allCourses.filter((course) =>
      course.title.toLowerCase().includes(courseSearch.toLowerCase()),
    );
  }, [allCourses, courseSearch]);

  if (loading) return <Loading />;
  if (error) return <p className="text-error">{error}</p>;

  return (
    <div>
      <h2 className="text-center mb-4">Manage Categories</h2>

      <div className="overflow-x-auto backdrop-blur-xl">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Courses</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {categories.map((cat) => (
              <tr key={cat._id}>
                <td className="font-semibold">{cat.title}</td>
                <td className="truncate max-w-xs">{cat.description || "-"}</td>
                <td>{cat.courseIds?.length || 0}</td>
                <td className="flex gap-2">
                  <button
                    className="btn btn-xs btn-info"
                    onClick={() => openEditModal(cat)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-xs btn-error"
                    onClick={() => openDeleteModal(cat)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {categories.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center">
                  No categories found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {action && selectedCategory && (
        <div className="modal modal-open">
          <div className="modal-box">
            {action === ACTIONS.EDIT && (
              <>
                <h3 className="font-bold text-lg mb-4">Edit Category</h3>

                <input
                  type="text"
                  className="input input-bordered w-full mb-3"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Category title"
                />

                <textarea
                  className="textarea textarea-bordered w-full mb-3"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Description"
                />

                <div className="border rounded-lg p-3 max-h-60 overflow-y-auto">
                  <p className="font-semibold mb-2">Select Courses</p>
                  <input
                    type="text"
                    className="input input-sm input-bordered w-full mb-3"
                    placeholder="Search courses..."
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                  />

                  {filteredCourses.map((course) => (
                    <label
                      key={course._id}
                      className="flex items-center gap-2 cursor-pointer mb-1"
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={form.courseIds.includes(course._id)}
                        onChange={() => toggleCourse(course._id)}
                      />
                      <span className="truncate">{course.title}</span>
                    </label>
                  ))}

                  {filteredCourses.length === 0 && (
                    <p className="text-sm opacity-60">No matching courses</p>
                  )}
                </div>

                <div className="modal-action">
                  <button className="btn btn-success" onClick={handleUpdate}>
                    Save Changes
                  </button>
                  <button className="btn" onClick={closeModal}>
                    Cancel
                  </button>
                </div>
              </>
            )}

            {action === ACTIONS.DELETE && (
              <>
                <h3 className="font-bold text-lg">Delete Category</h3>
                <p className="py-4">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">
                    {selectedCategory.title}
                  </span>
                  ?
                </p>

                <div className="modal-action">
                  <button className="btn btn-error" onClick={handleDelete}>
                    Delete
                  </button>
                  <button className="btn" onClick={closeModal}>
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCategories;
