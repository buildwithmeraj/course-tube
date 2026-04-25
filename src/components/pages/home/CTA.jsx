import Link from "next/link";
import React from "react";
import { FaFolderOpen } from "react-icons/fa6";
import { RiGraduationCapFill } from "react-icons/ri";

const CTA = () => {
  return (
    <div className="bg-accent my-6 rounded-lg py-16 px-4 sm:px-6 lg:px-8 text-secondary-content">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl font-bold  mb-4">
          Start Learning Today
        </h2>
        <p className="text-xl  mb-8 max-w-2xl mx-auto">
          Join thousands of students and unlock your potential with our
          comprehensive free collection of courses.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link className="btn btn-soft" href="/courses">
            <RiGraduationCapFill />
            Get Started Free
          </Link>
          <Link className="btn btn-secondary" href="/categories">
            <FaFolderOpen />
            Explore Categories
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CTA;
