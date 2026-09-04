"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  FaBars,
  FaCircleInfo,
  FaEnvelope,
  FaFolderOpen,
  FaGraduationCap,
  FaMagnifyingGlass,
  FaPlus,
  FaRegNoteSticky,
  FaShieldHalved,
  FaXmark,
} from "react-icons/fa6";
import { FaSignInAlt, FaSignOutAlt, FaUser } from "react-icons/fa";
import { MdDashboard, MdPlayCircleOutline } from "react-icons/md";
import { IoHomeSharp } from "react-icons/io5";
import ThemeSwitcher from "./ThemeSwitcher";
import Logo from "../utilities/Logo";

// Groups mirror how the product is actually used: what you're watching, what
// you could watch, and your own record — rather than a flat list of routes.
const GROUPS = [
  {
    label: "Watch",
    items: [
      { href: "/", label: "Home", Icon: IoHomeSharp },
      {
        href: "/profile/courses",
        label: "My courses",
        Icon: MdPlayCircleOutline,
        auth: true,
      },
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
  {
    label: "More",
    items: [
      { href: "/about", label: "About", Icon: FaCircleInfo },
      { href: "/contact", label: "Contact", Icon: FaEnvelope },
      { href: "/privacy", label: "Privacy", Icon: FaShieldHalved },
    ],
  },
];

const RailLink = ({ href, label, Icon, onNavigate }) => {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 border-l-2 px-4 py-2 text-sm transition-colors ${
        active
          ? "border-accent bg-base-100 font-semibold text-base-content"
          : "border-transparent text-base-content/70 hover:bg-base-100 hover:text-base-content"
      }`}
    >
      <Icon size={16} className="shrink-0" />
      {label}
    </Link>
  );
};

const Rail = ({ session, pending, onNavigate }) => (
  <nav aria-label="Main" className="flex h-full flex-col py-4">
    <Link
      href="/"
      onClick={onNavigate}
      className="mb-3 flex items-center px-4"
      aria-label="CourseTube home"
    >
      <Logo />
    </Link>

    {GROUPS.map((group) => {
      const items = group.items.filter(
        (i) =>
          (!i.auth || session?.user) &&
          (!i.admin || session?.user?.role === "admin"),
      );
      if (!items.length) return null;

      return (
        <div key={group.label} className="mt-2.5">
          <p className="eyebrow px-4 pb-1">{group.label}</p>
          {items.map((item) => (
            <RailLink key={item.href} {...item} onNavigate={onNavigate} />
          ))}
        </div>
      );
    })}

    {/* Nothing here until the session resolves: rendering "Sign in" first told
        every signed-in reader they were signed out for the length of the
        session round trip, then swapped it out under them. */}
    <div className="mt-auto px-4 pt-5">
      <div className="space-y-2">
      {pending ? (
        <div className="h-8" />
      ) : session?.user ? (
        <>
          <Link
            href="/profile/courses/add"
            onClick={onNavigate}
            className="btn btn-primary btn-sm w-full"
          >
            <FaPlus size={12} />
            Add playlist
          </Link>
          {/* Soft, not solid: leaving is a real action worth colouring, but it
              must not compete with the primary one directly above it. */}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="btn btn-error btn-soft btn-sm w-full"
          >
            <FaSignOutAlt size={13} />
            Sign out
          </button>
        </>
      ) : (
        <Link
          href="/login"
          onClick={onNavigate}
          className="btn btn-primary btn-sm w-full"
        >
          <FaSignInAlt size={13} />
          Sign in
        </Link>
      )}
      </div>

      {/* What is left of the old page footer once its links moved up into
          their own nav group: the two lines that were never navigation. */}
      <div className="mt-4 border-t border-hairline pt-3 text-center text-xs text-base-content/50">
        <p className="flex items-center justify-center gap-1.5">
          <FaRegNoteSticky size={10} className="shrink-0" />
          Playlists stream from YouTube
        </p>
        <p className="mt-1">
          © {new Date().getFullYear()} {process.env.NEXT_PUBLIC_SITE_NAME}
        </p>
      </div>
    </div>
  </nav>
);

const AppShell = ({ children }) => {
  const { data: session, status } = useSession();
  const pending = status === "loading";
  const [drawer, setDrawer] = useState(false);
  // /search is a search field, so the shell's trigger would be a second one on
  // the same screen. Everywhere else it is a link to that page rather than a
  // modal: the query belongs in the URL so results can be linked and revisited.
  const onSearchPage = usePathname() === "/search";

  // Escape closes it, and a locked body stops the page scrolling underneath
  useEffect(() => {
    if (!drawer) return;

    const onKey = (event) => {
      if (event.key === "Escape") setDrawer(false);
    };
    document.addEventListener("keydown", onKey);

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [drawer]);

  return (
    <div className="min-h-screen xl:grid xl:grid-cols-[216px_1fr]">
      {/* The rail is only persistent once there is room for it beside the
          content. Below xl it is the same slide-over the phone gets, rather
          than an icon strip that costs width and says less. */}
      <aside className="sticky top-0 hidden h-screen overflow-y-auto border-r border-hairline bg-surface xl:block">
        <Rail session={session} pending={pending} />
      </aside>

      {drawer && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button
            className="absolute inset-0 bg-black/50"
            aria-label="Close menu"
            onClick={() => setDrawer(false)}
          />
          <div className="absolute inset-y-0 left-0 w-64 overflow-y-auto border-r border-hairline bg-surface">
            <Rail
              session={session}
              pending={pending}
              onNavigate={() => setDrawer(false)}
            />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-hairline bg-surface/90 px-4 backdrop-blur-md xl:px-6">
          <button
            className="btn btn-ghost btn-sm px-2 xl:hidden"
            onClick={() => setDrawer(true)}
            aria-label="Open menu"
            aria-expanded={drawer}
          >
            {drawer ? <FaXmark size={16} /> : <FaBars size={16} />}
          </button>

          {/* Below xl the rail is closed, so the wordmark sits where the
              search field does on wide screens, and search moves into the page
              body where it has room for a full-width target. */}
          <Link href="/" className="xl:hidden" aria-label="CourseTube home">
            <Logo />
          </Link>

          {!onSearchPage && (
            <Link
              href="/search"
              className="hidden h-9 max-w-md flex-1 items-center gap-2 rounded-field border border-hairline bg-base-100 px-3 text-left text-sm text-base-content/50 hover:border-base-content/25 xl:flex"
            >
              <FaMagnifyingGlass size={13} />
              Search courses and lessons
            </Link>
          )}

          <div className="ml-auto flex items-center gap-2">
            <ThemeSwitcher />
            {!pending && !session?.user && (
              <Link href="/login" className="btn btn-ghost btn-sm">
                <FaSignInAlt size={14} />
                <span className="hidden sm:inline">Sign in</span>
              </Link>
            )}
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 pt-4 pb-14 xl:px-6 xl:pt-5">
          {!onSearchPage && (
            <Link
              href="/search"
              className="mb-4 flex h-10 w-full items-center gap-2 rounded-field border border-hairline bg-base-100 px-3 text-left text-sm text-base-content/50 hover:border-base-content/25 xl:hidden"
            >
              <FaMagnifyingGlass size={14} />
              Search courses and lessons
            </Link>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppShell;
