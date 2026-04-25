import React from "react";

const Footer = () => {
  return (
    <>
      <footer className="footer footer-center bg-primary/60 text-base-content/90 p-4 mb-16 lg:mb-0 w-full backdrop-blur-lg">
        <aside>
          <p>
            Copyright © {new Date().getFullYear()} - All right reserved by{" "}
            {process.env.SITE_NAME}
          </p>
        </aside>
      </footer>
    </>
  );
};

export default Footer;
