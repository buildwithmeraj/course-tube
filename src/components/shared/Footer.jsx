import React from "react";

const Footer = () => {
  return (
    <>
      <footer className="footer footer-center w-full bg-surface/60 p-4 text-base-content/90 mb-[var(--dock-offset)] backdrop-blur-lg">
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
