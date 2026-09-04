import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import HomeButton from "./HomeButton";

const NotFound = () => {
  return (
    <div className="min-h-[82vh] flex flex-col items-center justify-center">
      <div className="space-y-3 rounded-box border border-hairline bg-base-100 p-12 text-center">
        <div className="flex items-center justify-center">
          <FaExclamationTriangle size={120} className="text-warning" />
        </div>
        <h1 className="page-title">Page not found</h1>
        <p className="text-lg">
          The page you are looking for does not exist. It might have been moved
          or deleted.
        </p>
        <p className="text-lg">But you can return to the homepage.</p>
        <p>
          <HomeButton />
        </p>
      </div>
    </div>
  );
};

export default NotFound;
