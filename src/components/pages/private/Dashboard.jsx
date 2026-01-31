"use client";
import Loading from "@/components/ui/Loading";
import Link from "next/link";
import { useEffect, useState } from "react";

const ACTIONS = {
  APPROVE: "approve",
  REJECT: "reject",
  DELETE: "delete",
};

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [action, setAction] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/courses");
        if (!res.ok) throw new Error("Failed to fetch courses");

        const data = await res.json();
        setCourses(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const openModal = (course, actionType) => {
    setSelectedCourse(course);
    setAction(actionType);
  };

  const closeModal = () => {
    setSelectedCourse(null);
    setAction(null);
  };

  const updateCourseApproval = async (id, approved) => {
    const res = await fetch(`/api/courses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved }),
    });

    if (!res.ok) throw new Error("Update failed");

    setCourses((prev) =>
      prev.map((c) => (c._id === id ? { ...c, approved } : c)),
    );
  };

  const deleteCourse = async (id) => {
    const res = await fetch(`/api/courses/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Delete failed");

    setCourses((prev) => prev.filter((c) => c._id !== id));
  };

  const handleConfirm = async () => {
    if (!selectedCourse || !action) return;

    try {
      if (action === ACTIONS.APPROVE) {
        await updateCourseApproval(selectedCourse.id, true);
      }

      if (action === ACTIONS.REJECT) {
        await updateCourseApproval(selectedCourse.id, false);
      }

      if (action === ACTIONS.DELETE) {
        await deleteCourse(selectedCourse.id);
      }

      closeModal();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <Loading />;
  if (error) return <p className="text-error">{error}</p>;

  return (
    <div>
      <h2 className="text-center">All Courses</h2>

      <div className="overflow-x-auto backdrop-blur-xl">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Approved</th>
              <th>Total Videos</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {courses.map((item) => (
              <tr key={item._id}>
                <td className="font-bold">
                  <Link href={`/courses/${item._id}`} className="link">
                    {item.title}
                  </Link>
                </td>
                <td>{item.approved ? "Yes" : "No"}</td>
                <td>{item.totalCount}</td>

                <td>
                  <div className="flex gap-2">
                    {!item.approved && (
                      <button
                        className="btn btn-xs btn-success"
                        onClick={() =>
                          openModal(
                            { id: item._id, name: item.title },
                            ACTIONS.APPROVE,
                          )
                        }
                      >
                        Approve
                      </button>
                    )}

                    {item.approved && (
                      <button
                        className="btn btn-xs btn-warning"
                        onClick={() =>
                          openModal(
                            { id: item._id, name: item.title },
                            ACTIONS.REJECT,
                          )
                        }
                      >
                        Reject
                      </button>
                    )}

                    <button
                      className="btn btn-xs btn-error"
                      onClick={() =>
                        openModal(
                          { id: item._id, name: item.title },
                          ACTIONS.DELETE,
                        )
                      }
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {courses.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center">
                  No courses found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {action && selectedCourse && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg capitalize">{action} Course</h3>

            <p className="py-4">
              Are you sure you want to{" "}
              <span className="font-semibold">{action}</span>{" "}
              <span className="font-bold">{selectedCourse.name}</span>?
            </p>

            <div className="modal-action">
              <button
                className={`btn ${
                  action === ACTIONS.APPROVE
                    ? "btn-success"
                    : action === ACTIONS.REJECT
                      ? "btn-warning"
                      : "btn-error"
                }`}
                onClick={handleConfirm}
              >
                Confirm
              </button>

              <button className="btn" onClick={closeModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
