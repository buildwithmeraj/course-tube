"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  FaBars,
  FaFolderOpen,
  FaGraduationCap,
  FaMagnifyingGlass,
  FaPlus,
  FaRegNoteSticky,
  FaXmark,
} from "react-icons/fa6";
import { FaSignInAlt, FaSignOutAlt, FaUser } from "react-icons/fa";
import { MdDashboard, MdPlayCircleOutline } from "react-icons/md";
import { IoHomeSharp } from "react-icons/io5";
import ThemeSwitcher from "./ThemeSwitcher";
import Logo from "../utilities/Logo";
import { useSearch } from "@/app/contexts/SearchContext";

// Groups mirror how the product is actually used: what you're watching, what
// you could watch, and your own record — rather than a flat list of routes.
const GROUPS = [
  {
    label: "Watch",
    items: [
      { href: "/", label: "Home", Icon: IoHomeSharp },
      { href: "/profile/courses", label: "My courses", Icon: MdPlayCircleOutline, auth: true },
    ],
  },
  {
    label: "Browse",
    items: [
      { href: "/courses", label: "All courses", Icon: FaGraduationCap },
      { href: "/categories", label: "Categories", Icon: FaFolderOpen },
      { href: "/search", label: "Search", Icon: FaMagnifyingGlass },
    ],
  },
  {
    label: "You",
    items: [
      { href: "/profile", label: "Profile", Icon: FaUser, auth: true },
      { href: "/dashboard", label: "Dashboard", Icon: MdDashboard, admin: true },
    ],
  },
];

const RailLink = ({ href, label, Icon, onNavigate, collapsible = true }) => {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      title={collapsible ? label : undefined}
      className={`flex items-center gap-3 border-l-2 py-2 text-sm transition-colors ${
        collapsible ? "justify-center px-0 xl:justify-start xl:px-4" : "px-4"
      } ${
        active
          ? "border-accent bg-base-100 font-semibold text-base-content"
          : "border-transparent text-base-content/70 hover:bg-base-100 hover:text-base-content"
      }`}
    >
      <Icon size={16} className="shrink-0" />
      <span className={collapsible ? "hidden xl:inline" : ""}>{label}</span>
    </Link>
  );
};

const Rail = ({ session, onNavigate, collapsible = false }) => (
  <nav aria-label="Main" className="flex h-full flex-col py-4">
    <Link
      href="/"
      onClick={onNavigate}
      className={`mb-3 flex items-center ${
        collapsible ? "justify-center xl:justify-start xl:px-4" : "px-4"
      }`}
      aria-label="CourseTube home"
    >
      <Logo compact={collapsible} />
    </Link>

    {GROUPS.map((group) => {
      const items = group.items.filter(
        (i) =>
          (!i.auth || session?.user) &&
          (!i.admin || session?.user?.role === "admin"),
      );
      if (!items.length) return null;

      return (
        <div
          key={group.label}
          className={`mt-3 ${
            collapsible
              ? "border-t border-hairline pt-3 first:border-t-0 xl:border-t-0 xl:pt-0"
              : ""
          }`}
        >
          <p
            className={`eyebrow px-4 pb-1 ${collapsible ? "hidden xl:block" : ""}`}
          >
            {group.label}
          </p>
          {items.map((item) => (
            <RailLink
              key={item.href}
              {...item}
              onNavigate={onNavigate}
              collapsible={collapsible}
            />
          ))}
        </div>
      );
    })}

    <div
      className={`mt-auto pt-6 ${collapsible ? "px-2 xl:px-4" : "px-4"}`}
    >
      {session?.user ? (
        <Link
          href="/profile/courses/add"
          onClick={onNavigate}
          title="Add playlist"
          className="btn btn-primary btn-sm w-full"
        >
          <FaPlus size={12} />
          <span className={collapsible ? "hidden xl:inline" : ""}>
            Add playlist
          </span>
        </Link>
      ) : (
        <Link
          href="/login"
          onClick={onNavigate}
          title="Sign in"
          className="btn btn-primary btn-sm w-full"
        >
          <FaSignInAlt size={13} />
          <span className={collapsible ? "hidden xl:inline" : ""}>Sign in</span>
        </Link>
      )}
    </div>
  </nav>
);

const AppShell = ({ children }) => {
  const { data: session } = useSession();
  const { setShowSearchModal } = useSearch();
  const [drawer, setDrawer] = useState(false);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[60px_1fr] xl:grid-cols-[216px_1fr]">
      {/* Icon-only from lg, full labels from xl. At 1024 a 216px rail left the
          watch page's player and queue too narrow to be comfortable. */}
      <aside className="sticky top-0 hidden h-screen overflow-y-auto border-r border-hairline bg-surface lg:block">
        <Rail session={session} collapsible />
      </aside>

      {/* Slide-over rail below lg */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-black/50"
            aria-label="Close menu"
            onClick={() => setDrawer(false)}
          />
          <div className="absolute inset-y-0 left-0 w-64 overflow-y-auto border-r border-hairline bg-surface">
            <Rail session={session} onNavigate={() => setDrawer(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-hairline bg-surface/90 px-4 backdrop-blur-md lg:px-6">
          <button
            className="btn btn-ghost btn-sm px-2 lg:hidden"
            onClick={() => setDrawer(true)}
            aria-label="Open menu"
          >
            {drawer ? <FaXmark size={16} /> : <FaBars size={16} />}
          </button>

          <button
            onClick={() => setShowSearchModal(true)}
            className="flex h-9 max-w-md flex-1 items-center gap-2 rounded-field border border-hairline bg-base-100 px-3 text-left text-sm text-base-content/50 hover:border-base-content/25"
          >
            <FaMagnifyingGlass size={13} />
            Search courses and lessons
          </button>

          <div className="ml-auto flex items-center gap-2">
            <ThemeSwitcher />
            {session?.user ? (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="btn btn-ghost btn-sm"
                aria-label="Sign out"
              >
                <FaSignOutAlt size={14} />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            ) : (
              <Link href="/login" className="btn btn-ghost btn-sm">
                <FaSignInAlt size={14} />
                <span className="hidden sm:inline">Sign in</span>
              </Link>
            )}
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 pt-5 pb-14 lg:px-6">{children}</main>

        <footer className="border-t border-hairline px-4 py-4 text-xs text-base-content/50 lg:px-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>
              © {new Date().getFullYear()} {process.env.NEXT_PUBLIC_SITE_NAME}
            </span>
            <Link href="/about" className="hover:text-base-content">About</Link>
            <Link href="/contact" className="hover:text-base-content">Contact</Link>
            <Link href="/privacy" className="hover:text-base-content">Privacy</Link>
            <span className="ml-auto flex items-center gap-1.5">
              <FaRegNoteSticky size={11} />
              Playlists stream from YouTube
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AppShell;
