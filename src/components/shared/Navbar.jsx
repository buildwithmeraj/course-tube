"use client";
import React, { useState } from "react";
import Logo from "../utilities/Logo";
import Link from "next/link";
import ThemeSwitcher from "./ThemeSwitcher";
import Search from "./Search";
import { useSession } from "next-auth/react";
import { IoHomeSharp } from "react-icons/io5";
import { PiLinkSimpleBold } from "react-icons/pi";
import { RiGraduationCapFill } from "react-icons/ri";
import { FaBars, FaFolderOpen } from "react-icons/fa6";
import { FaInfoCircle, FaSignInAlt, FaUser } from "react-icons/fa";
import { MdDashboard, MdPrivacyTip } from "react-icons/md";
import { MdClose } from "react-icons/md";
import { IoMdMail } from "react-icons/io";
import { ImSearch } from "react-icons/im";
import { useSearch } from "@/app/contexts/SearchContext";

const Navbar = () => {
  const { data: session, status } = useSession();
  const { showSearchModal, setShowSearchModal } = useSearch();
  return (
    <>
      <div className="drawer">
        <input id="sidebar" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <div className="navbar fixed w-full z-20 top-0 start-0 bg-primary/60 px-5 backdrop-blur-xl">
            <div className="navbar-start">
              <div className="dropdown">
                <label htmlFor="sidebar" className="lg:hidden">
                  <FaBars size={20} className="mr-2 lg:hidden" />
                </label>
              </div>
              <Link className="text-xl" href="/">
                <Logo />
              </Link>
            </div>
            <div className="navbar-center hidden lg:flex md:gap-2 gap-4">
              <ul className="menu menu-horizontal px-1">
                <li>
                  <button
                    className="hover:text-primary hover:font-semibold cursor-pointer"
                    onClick={() => setShowSearchModal(true)}
                  >
                    <ImSearch className="inline pb-0.5" size={15} />
                    Search
                  </button>
                </li>
                <li>
                  <Link href="/courses">
                    <RiGraduationCapFill className="mb-0.5" />
                    Courses
                  </Link>
                </li>
                <li>
                  <Link href="/categories">
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
                    <ul className="p-2 bg-base-100 w-40 z-1">
                      <li>
                        <Link href="/about">
                          <FaInfoCircle />
                          About US
                        </Link>
                      </li>
                      <li>
                        <Link href="/contact">
                          <IoMdMail />
                          Contact US
                        </Link>
                      </li>
                      <li>
                        <Link href="/privacy">
                          <MdPrivacyTip />
                          Privacy Policy
                        </Link>
                      </li>
                    </ul>
                  </details>
                </li>
              </ul>
            </div>
            <div className="navbar-end space-x-1">
              {session?.user?.role === "admin" && (
                <Link
                  className="btn btn-ghost hidden md:flex"
                  href="/dashboard"
                >
                  <MdDashboard size={15} />
                  Dashboard
                </Link>
              )}

              {session ? (
                <Link className="btn btn-ghost hidden md:flex" href="/profile">
                  <FaUser size={15} />
                  Profile
                </Link>
              ) : (
                <Link className="btn btn-ghost hidden md:flex" href="/login">
                  <FaSignInAlt />
                  Login
                </Link>
              )}
              <ThemeSwitcher />
            </div>
          </div>
        </div>

        <div className="drawer-side z-40">
          <label htmlFor="sidebar" className="drawer-overlay"></label>
          <ul className="menu bg-base-200 min-h-full w-80 p-4">
            <li className="flex justify-center items-center -ml-4 mb-6">
              <Logo />
            </li>
            <li>
              <label htmlFor="sidebar" className="" aria-label="Close sidebar">
                <MdClose size={18} className="-mr-1 -pr-1" /> Close
              </label>
            </li>
            <li>
              <Link href="/">
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
                <Link className="" href="/dashboard">
                  <MdDashboard size={15} />
                  Dashboard
                </Link>
              </li>
            )}
            {session ? (
              <li>
                <Link className="" href="/profile">
                  <FaUser size={15} />
                  Profile
                </Link>
              </li>
            ) : (
              <li>
                <Link className="" href="/login">
                  <FaSignInAlt />
                  Login
                </Link>
              </li>
            )}
            <li>
              <Link href="/courses">
                <RiGraduationCapFill className="mb-0.5" />
                Courses
              </Link>
            </li>
            <li>
              <Link href="/categories">
                <FaFolderOpen />
                Categories
              </Link>
            </li>
            <li>
              <Link href="/about">
                <FaInfoCircle />
                About US
              </Link>
            </li>
            <li>
              <Link href="/contact">
                <IoMdMail />
                Contact US
              </Link>
            </li>
            <li>
              <Link href="/privacy">
                <MdPrivacyTip />
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>
      {showSearchModal && <Search setShowSearchModal={setShowSearchModal} />}
    </>
  );
};

export default Navbar;
