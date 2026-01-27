import Link from "next/link";
import React from "react";

const CTA = () => {
  return (
    <div className="bg-secondary my-6 rounded-lg py-16 px-4 sm:px-6 lg:px-8 text-secondary-content">
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
            Get Started Free
          </Link>
          <Link className="btn btn-outline" href="/categories">
            Explore Categories
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CTA;
