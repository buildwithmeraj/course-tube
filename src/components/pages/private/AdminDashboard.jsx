"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  FaBook,
  FaBookOpen,
  FaLayerGroup,
  FaList,
  FaPlusCircle,
  FaRegChartBar,
} from "react-icons/fa";
import { HiMiniWrenchScrewdriver } from "react-icons/hi2";

const StatCard = ({ title, value, icon: Icon, hint }) => (
  <div className="rounded-box border border-hairline bg-base-100 p-4">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="eyebrow">{title}</p>
        <div className="figure-text mt-1 text-2xl font-bold">{value}</div>
        <p className="mt-1 text-xs text-base-content/60">{hint}</p>
      </div>
      <span className="rounded-field bg-surface p-2 text-base-content/50">
        <Icon size={16} />
      </span>
    </div>
  </div>
);

const DashboardCard = ({ icon: Icon, title, description, href }) => (
  <Link
    href={href}
    className="flex items-center gap-4 rounded-box border border-hairline bg-base-100 p-4 transition-colors hover:border-primary/50 hover:bg-surface"
  >
    <span className="rounded-field bg-primary/10 p-2.5 text-primary">
      <Icon size={18} />
    </span>
    <span className="min-w-0 flex-1">
      <span className="card-heading block">{title}</span>
      <span className="block text-xs text-base-content/60">{description}</span>
    </span>
    <HiMiniWrenchScrewdriver size={15} className="text-base-content/40" />
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
    },
    {
      icon: FaList,
      title: "Manage Categories",
      description: "Organize course categories",
      href: "/dashboard/categories",
    },
  ];

  const s = stats || {};
  const statCards = [
    {
      title: "Total Courses",
      value: loading ? "..." : (s.coursesCount ?? 0),
      icon: FaBook,
      hint: "Courses published across the platform",
    },
    {
      title: "Total Enrolls",
      value: loading ? "..." : (s.enrollsCount ?? 0),
      icon: FaRegChartBar,
      hint: "Learners currently participating",
    },
    {
      title: "Total Categories",
      value: loading ? "..." : (s.categoriesCount ?? 0),
      icon: FaLayerGroup,
      hint: "Structured content groups",
    },
    {
      title: "Total Videos",
      value: loading ? "..." : (s.videosCount ?? 0),
      icon: FaList,
      hint: "Tracked playlist videos",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-2">
          <h1 className="page-title">Admin Dashboard</h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/courses" className="btn btn-primary btn-sm">
            <FaBook />
            Courses
          </Link>
          <Link
            href="/dashboard/categories/add"
            className="btn btn-soft btn-sm"
          >
            <FaPlusCircle />
            Add Category
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {cards.map((card) => (
          <DashboardCard key={card.href} {...card} />
        ))}

        <div className="col-span-full rounded-box border border-hairline bg-surface p-4">
          <p className="eyebrow">Workflow</p>
          <ul className="mt-2 grid gap-1.5 text-sm text-base-content/70 sm:grid-cols-3">
            <li>Review new course submissions</li>
            <li>Organise category mappings</li>
            <li>Add structure before publishing</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
