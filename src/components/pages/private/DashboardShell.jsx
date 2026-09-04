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
  { href: "/dashboard", label: "Overview", icon: FaTachometerAlt },
  { href: "/dashboard/courses", label: "Courses", icon: FaBook },
  { href: "/dashboard/categories", label: "Categories", icon: FaLayerGroup },
  { href: "/dashboard/categories/add", label: "Add category", icon: FaPlusCircle },
];

const getActiveHref = (pathname) => {
  const sortedItems = [...navItems].sort(
    (a, b) => b.href.length - a.href.length,
  );

  return sortedItems.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  )?.href;
};

// A tab strip rather than a second sidebar: the app rail already handles
// top-level navigation, so a nested one both duplicated it and cost 18rem of
// the content width on every dashboard page.
const DashboardShell = ({ children }) => {
  const pathname = usePathname();
  const activeHref = getActiveHref(pathname);

  return (
    <div className="space-y-5">
      <div role="tablist" className="tabs tabs-border">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            role="tab"
            aria-selected={activeHref === href}
            className={`tab gap-2 ${activeHref === href ? "tab-active" : ""}`}
          >
            <Icon size={13} />
            {label}
          </Link>
        ))}
      </div>

      {children}
    </div>
  );
};

export default DashboardShell;
