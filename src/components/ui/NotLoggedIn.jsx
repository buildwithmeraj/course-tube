import Link from "next/link";
import React from "react";
import { FaSignInAlt } from "react-icons/fa";

const NotLoggedIn = () => {
  return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center flex-col">
        <FaSignInAlt size={128} className="text-base-content/50" />
        <h2 className="text-center">Login required</h2>
        <p className="border border-dashed p-4 rounded-xl text-center">
          You must be logged in to access this page.
        </p>
        <Link className="btn btn-primary mt-4" href="/login">
          <FaSignInAlt />
          Login Now
        </Link>
      </div>
    </div>
  );
};

export default NotLoggedIn;
