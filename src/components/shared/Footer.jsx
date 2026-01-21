import React from "react";

const Footer = () => {
  return (
    <>
      <footer className="footer sm:footer-horizontal footer-center bg-primary/60 text-base-content p-4 font-semibold hidden lg:block">
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
