"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import {
  FaBook,
  FaLayerGroup,
  FaPlusCircle,
  FaTachometerAlt,
} from "react-icons/fa";

const navItems = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: FaTachometerAlt,
    description: "Performance snapshot and shortcuts",
  },
  {
    href: "/dashboard/courses",
    label: "Courses",
    icon: FaBook,
    description: "Approve, reject, and delete courses",
  },
  {
    href: "/dashboard/categories",
    label: "Categories",
    icon: FaLayerGroup,
    description: "Organize categories and linked courses",
  },
  {
    href: "/dashboard/categories/add",
    label: "Add Category",
    icon: FaPlusCircle,
    description: "Create a new category",
  },
];

const getActiveHref = (pathname) => {
  const sortedItems = [...navItems].sort(
    (a, b) => b.href.length - a.href.length,
  );

  return sortedItems.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  )?.href;
};

const DashboardShell = ({ children }) => {
  const pathname = usePathname();
  const activeHref = getActiveHref(pathname);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-3xl border border-base-200 bg-base-100/90 p-4 shadow-sm backdrop-blur-xl">
            <div className="mb-4">
              <p className="mt-1 text-lg font-bold">Dashboard navigation</p>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeHref === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-start gap-3 rounded-2xl border p-3 transition ${
                      isActive
                        ? "border-primary bg-primary/10"
                        : "border-base-200 bg-base-100 hover:border-base-300 hover:bg-base-200/70"
                    }`}
                  >
                    <span
                      className={`mt-0.5 rounded-xl p-2 ${
                        isActive
                          ? "bg-primary text-primary-content"
                          : "bg-base-200 text-base-content"
                      }`}
                    >
                      <Icon size={14} />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold">{item.label}</span>
                      <span className="block text-xs leading-5 text-base-content/60">
                        {item.description}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <div className="space-y-6">
          <div className="grid gap-2 rounded-3xl border border-base-200 bg-base-100 p-3 shadow-sm lg:hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeHref === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium ${
                    isActive
                      ? "bg-primary text-primary-content"
                      : "bg-base-200/60 text-base-content"
                  }`}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardShell;
