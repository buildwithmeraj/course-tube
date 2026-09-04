"use client";
import React, { useState } from "react";
import Logo from "../utilities/Logo";
import Link from "next/link";
import ThemeSwitcher from "./ThemeSwitcher";
import Search from "./Search";
import { signOut, useSession } from "next-auth/react";
import { IoHomeSharp } from "react-icons/io5";
import { PiLinkSimpleBold } from "react-icons/pi";
import { RiGraduationCapFill } from "react-icons/ri";
import { FaBars, FaFolderOpen } from "react-icons/fa6";
import {
  FaInfoCircle,
  FaSignInAlt,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";
import { MdDashboard, MdPrivacyTip } from "react-icons/md";
import { MdClose } from "react-icons/md";
import { IoMdMail } from "react-icons/io";
import { ImSearch } from "react-icons/im";
import { useSearch } from "@/app/contexts/SearchContext";

const Navbar = ({ forceHardNavigation = false }) => {
  const { data: session, status } = useSession();
  const { showSearchModal, setShowSearchModal } = useSearch();
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };
  const navigateHard = (href) => {
    if (forceHardNavigation) {
      return {
        onClick: (event) => {
          event.preventDefault();
          window.location.assign(href);
        },
      };
    }

    return {};
  };
  return (
    <>
      <div className="drawer">
        <input id="sidebar" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <div className="navbar fixed w-full z-20 top-0 start-0 bg-surface/60 px-5 backdrop-blur-xl">
            <div className="navbar-start flex items-center">
              <div className="dropdown">
                <label htmlFor="sidebar" className="flex lg:hidden">
                  <FaBars size={18} className="mr-2 lg:hidden" />
                </label>
              </div>
              <Link className="text-xl" href="/" {...navigateHard("/")}>
                <Logo />
              </Link>
            </div>
            <div className="navbar-center hidden lg:flex md:gap-2 gap-4">
              <ul className="menu menu-horizontal px-1">
                <li>
                  <button
                    className="cursor-pointer"
                    onClick={() => setShowSearchModal(true)}
                  >
                    <ImSearch className="inline pb-0.5" size={15} />
                    Search
                  </button>
                </li>
                <li>
                  <Link href="/courses" {...navigateHard("/courses")}>
                    <RiGraduationCapFill className="mb-0.5" />
                    Courses
                  </Link>
                </li>
                <li>
                  <Link href="/categories" {...navigateHard("/categories")}>
                    <FaFolderOpen />
                    Categories
                  </Link>
                </li>
                <li>
                  <details>
                    <summary>
                      <PiLinkSimpleBold className="inline mb-0.5 mr-1" />
                      Links
                    </summary>
                    <ul className="p-2 bg-base-100 w-40 z-10">
                      <li>
                        <Link href="/about" {...navigateHard("/about")}>
                          <FaInfoCircle />
                          About US
                        </Link>
                      </li>
                      <li>
                        <Link href="/contact" {...navigateHard("/contact")}>
                          <IoMdMail />
                          Contact US
                        </Link>
                      </li>
                      <li>
                        <Link href="/privacy" {...navigateHard("/privacy")}>
                          <MdPrivacyTip />
                          Privacy Policy
                        </Link>
                      </li>
                    </ul>
                  </details>
                </li>
              </ul>
            </div>
            <div className="navbar-end">
              {session?.user?.role === "admin" && (
                <Link
                  className="btn btn-ghost hidden md:flex"
                  href="/dashboard"
                  {...navigateHard("/dashboard")}
                >
                  <MdDashboard size={15} />
                  Dashboard
                </Link>
              )}

              {session ? (
                <>
                  <Link
                    className="btn btn-ghost hidden md:flex"
                    href="/profile"
                    {...navigateHard("/profile")}
                  >
                    <FaUser size={15} />
                    Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="btn btn-sm btn-ghost hover:btn-error"
                  >
                    <FaSignOutAlt />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  className="btn btn-ghost hidden md:flex"
                  href="/login"
                  {...navigateHard("/login")}
                >
                  <FaSignInAlt />
                  Login
                </Link>
              )}
              <div className="hidden sm:flex ml-2">
                <ThemeSwitcher />
              </div>
            </div>
          </div>
        </div>

        <div className="drawer-side z-40">
          <label htmlFor="sidebar" className="drawer-overlay"></label>
          <ul className="menu bg-base-200 min-h-full w-80 p-4">
            <li className="flex justify-center items-center -ml-4 mb-2">
              <Logo />
            </li>
            <li>
              <label
                htmlFor="sidebar"
                className=" flex justify-center font-semibold"
                aria-label="Close sidebar"
              >
                <MdClose size={18} className="-mr-1 -pr-1" /> Close Menu
              </label>
            </li>
            <li>
              <Link href="/" {...navigateHard("/")}>
                <IoHomeSharp className="mb-0.5" /> Home
              </Link>
            </li>
            <li>
              <button
                className="hover:text-primary hover:font-semibold cursor-pointer"
                onClick={() => setShowSearchModal(true)}
              >
                <ImSearch className="inline pb-0.5" size={16} />
                Search
              </button>
            </li>
            {session?.user?.role === "admin" && (
              <li>
                <Link href="/dashboard" {...navigateHard("/dashboard")}>
                  <MdDashboard size={15} />
                  Dashboard
                </Link>
              </li>
            )}
            {session ? (
              <li>
                <Link href="/profile" {...navigateHard("/profile")}>
                  <FaUser size={15} />
                  Profile
                </Link>
              </li>
            ) : (
              <li>
                <Link href="/login" {...navigateHard("/login")}>
                  <FaSignInAlt />
                  Login
                </Link>
              </li>
            )}
            <li>
              <Link href="/courses" {...navigateHard("/courses")}>
                <RiGraduationCapFill className="mb-0.5" />
                Courses
              </Link>
            </li>
            <li>
              <Link href="/categories" {...navigateHard("/categories")}>
                <FaFolderOpen />
                Categories
              </Link>
            </li>
            <li>
              <Link href="/about" {...navigateHard("/about")}>
                <FaInfoCircle />
                About US
              </Link>
            </li>
            <li>
              <Link href="/contact" {...navigateHard("/contact")}>
                <IoMdMail />
                Contact US
              </Link>
            </li>
            <li>
              <Link href="/privacy" {...navigateHard("/privacy")}>
                <MdPrivacyTip />
                Privacy Policy
              </Link>
            </li>
            <li className="grid justify-self-center">
              <div className="place-self-center font-bold text-lg">Theme</div>
              <ThemeSwitcher />
            </li>
          </ul>
        </div>
      </div>
      {showSearchModal && <Search setShowSearchModal={setShowSearchModal} />}
    </>
  );
};

export default Navbar;
