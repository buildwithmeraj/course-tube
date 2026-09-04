import Link from "next/link";
import React from "react";
import { FaFolderOpen } from "react-icons/fa6";
import { RiGraduationCapFill } from "react-icons/ri";

const CTA = () => {
  return (
    <div className="bg-surface/60 rounded-xl py-16 px-4 sm:px-6 lg:px-8 text-base-content">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="section-title text-3xl sm:text-4xl mb-4">
          Ready to keep learning?
        </h2>
        <p className="text-xl  mb-8 max-w-2xl mx-auto">
          Browse curated playlists, save your progress, and come back whenever
          you are ready for the next lesson.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link className="btn btn-primary" href="/courses">
            <RiGraduationCapFill />
            Browse Courses
          </Link>
          <Link className="btn btn-soft" href="/categories">
            <FaFolderOpen />
            Explore Topics
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CTA;
