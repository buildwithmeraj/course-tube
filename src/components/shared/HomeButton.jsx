"use client";

import { FaHome } from "react-icons/fa";

const HomeButton = ({ className = "btn btn-primary" }) => {
  const handleGoHome = () => {
    window.location.assign("/");
  };

  return (
    <button type="button" className={className} onClick={handleGoHome}>
      <FaHome />
      Home
    </button>
  );
};

export default HomeButton;
