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

const StatCard = ({ title, value, color, tint, icon: Icon, hint }) => (
  <div className="rounded-xl border border-base-200 bg-base-100/90 p-5 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-base-content/50">
          {title}
        </p>
        <div className={`mt-2 text-3xl font-black ${color}`}>{value}</div>
        <p className="mt-2 text-sm text-base-content/60">{hint}</p>
      </div>
      <div className={`rounded-xl p-3 ${color} ${tint}`}>
        <Icon size={22} />
      </div>
    </div>
  </div>
);

const DashboardCard = ({ icon: Icon, title, description, href, color }) => (
  <div
    className={`card overflow-hidden border shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md rounded-xl ${color}`}
  >
    <div className="card-body gap-5 bg-base-100/90">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`rounded-xl p-3 ${color} text-accent-content shadow-sm`}>
            <Icon size={20} />
          </div>
          <div>
            <h3 className="card-title text-lg">{title}</h3>
            <p className="text-sm text-base-content/60">{description}</p>
          </div>
        </div>
        <Link href={href} className="btn btn-accent">
          <HiMiniWrenchScrewdriver />
          Manage
        </Link>
      </div>
    </div>
  </div>
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
      color: "border-primary bg-accent",
    },
    {
      icon: FaList,
      title: "Manage Categories",
      description: "Organize course categories",
      href: "/dashboard/categories",
      color: "border-info bg-accent",
    },
  ];

  const s = stats || {};
  const statCards = [
    {
      title: "Total Courses",
      value: loading ? "..." : (s.coursesCount ?? 0),
      color: "text-primary",
      tint: "bg-primary/10",
      icon: FaBook,
      hint: "Courses published across the platform",
    },
    {
      title: "Total Enrolls",
      value: loading ? "..." : (s.enrollsCount ?? 0),
      color: "text-info",
      tint: "bg-info/10",
      icon: FaRegChartBar,
      hint: "Learners currently participating",
    },
    {
      title: "Total Categories",
      value: loading ? "..." : (s.categoriesCount ?? 0),
      color: "text-success",
      tint: "bg-success/10",
      icon: FaLayerGroup,
      hint: "Structured content groups",
    },
    {
      title: "Total Videos",
      value: loading ? "..." : (s.videosCount ?? 0),
      color: "text-warning",
      tint: "bg-warning/10",
      icon: FaList,
      hint: "Tracked playlist videos",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-2">
          <h1 className="page-title text-accent">Admin Dashboard</h1>
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

        <div className="card border border-base-200 bg-gradient-to-br from-accent/10 via-base-100 to-primary/10 shadow-sm col-span-full">
          <div className="card-body">
            <h3 className="card-title text-accent text-2xl">
              Workflow snapshot
            </h3>
            <div className="space-y-3 text-sm text-base-content/70">
              <p>
                Approve pending courses, keep categories tidy, and create
                structure quickly with the links in the sidebar.
              </p>
              <ul className="space-y-2">
                <li>• Review new course submissions</li>
                <li>• Organize category mappings</li>
                <li>• Add structure before publishing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
