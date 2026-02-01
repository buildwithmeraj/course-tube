import React from "react";

const Footer = () => {
  return (
    <>
      <footer className="footer footer-center bg-primary/60 text-base-content p-4 font-semibold mb-15 lg:mb-0 w-full">
        <aside>
          <p>
            Copyright © {new Date().getFullYear()} - All right reserved by
            CourseTube
          </p>
        </aside>
      </footer>
    </>
  );
};

export default Footer;
