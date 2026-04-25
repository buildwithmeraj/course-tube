"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FaBook, FaList } from "react-icons/fa";

const StatCard = ({ title, value, color }) => (
  <div className="bg-base-100 rounded-lg shadow p-2 text-center">
    <div className="stat-title">{title}</div>
    <div className={`stat-value ${color}`}>{value}</div>
  </div>
);

const DashboardCard = ({ icon: Icon, title, description, href, color }) => (
  <Link href={href}>
    <div
      className={`card bg-base-100 shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-x-4 ${color}`}
    >
      <div className="card-body">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${color} text-white`}>
            <Icon size={24} />
          </div>
          <div>
            <h3 className="card-title text-lg">{title}</h3>
            <p className="text-sm text-base-content/60">{description}</p>
          </div>
        </div>
      </div>
    </div>
  </Link>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      icon: FaBook,
      title: "Manage Courses",
      description: "Create, edit, and delete courses",
      href: "/dashboard/courses",
      color: "border-primary bg-primary/70",
    },
    {
      icon: FaList,
      title: "Manage Categories",
      description: "Organize course categories",
      href: "/dashboard/categories",
      color: "border-info bg-info/40",
    },
  ];

  const s = stats || {};

  return (
    <div>
      <div className="mb-8 mt-2">
        <h1 className="title-accent text-4xl font-bold mb-2">
          Admin Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 backdrop-blur-md">
        <StatCard
          title="Total Courses"
          value={loading ? "..." : (s.coursesCount ?? 0)}
          color="text-primary"
        />

        <StatCard
          title="Total Enrolls"
          value={loading ? "..." : (s.enrollsCount ?? 0)}
          color="text-info"
        />

        <StatCard
          title="Total Categories"
          value={loading ? "..." : (s.categoriesCount ?? 0)}
          color="text-success"
        />

        <StatCard
          title="Total Videos"
          value={loading ? "..." : (s.videosCount ?? 0)}
          color="text-warning"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 backdrop-blur-md">
        {cards.map((card) => (
          <DashboardCard key={card.href} {...card} />
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
