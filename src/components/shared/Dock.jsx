"use client";
import React from "react";
import { FaFolderOpen, FaUser } from "react-icons/fa6";
import { ImSearch } from "react-icons/im";
import { IoHomeSharp } from "react-icons/io5";
import { RiGraduationCapFill } from "react-icons/ri";
import DockNavLink from "../utilities/DockNavLink";
import { useSearch } from "@/app/contexts/SearchContext";
import { useSession } from "next-auth/react";
import { FaSignInAlt } from "react-icons/fa";

const Dock = () => {
  const { data: session, status } = useSession();
  const { showSearchModal, setShowSearchModal } = useSearch();
  return (
    <div className="z-20 dock bg-primary/60 backdrop-blur-xl lg:hidden">
      <DockNavLink href="/">
        <IoHomeSharp size={20} />
        <span className="dock-label">Home</span>
      </DockNavLink>
      <button
        className={showSearchModal ? "dock-active" : ""}
        onClick={() => setShowSearchModal(true)}
      >
        <ImSearch size={18} />
        <span className="dock-label">Search</span>
      </button>
      <DockNavLink href="/courses">
        <RiGraduationCapFill size={20} />
        <span className="dock-label">Courses</span>
      </DockNavLink>
      <DockNavLink className="hidden md:flex" href="/categories">
        <FaFolderOpen size={20} />
        <span className="dock-label">Categories</span>
      </DockNavLink>
      {session ? (
        <DockNavLink href="/profile">
          <FaUser size={16} />
          <span className="dock-label">Profile</span>
        </DockNavLink>
      ) : (
        <DockNavLink href="/login">
          <FaSignInAlt size={20} />
          <span className="dock-label">Login</span>
        </DockNavLink>
      )}
    </div>
  );
};

export default Dock;
