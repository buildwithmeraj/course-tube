import React from "react";

const WIDTHS = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-xl",
};

// One shape for every form in the app. The title sits above the panel and to
// the left, like every other page header, rather than centred inside a card —
// and the panel is centred horizontally without pinning it to a viewport
// height, which fought the shell's own header and footer.
const FormPanel = ({ title, description, width = "sm", children, footer }) => (
  <div className={`mx-auto w-full ${WIDTHS[width] ?? WIDTHS.sm} py-4`}>
    <h1 className="page-title mb-1">{title}</h1>
    {description && (
      <p className="mb-4 text-sm text-base-content/70">{description}</p>
    )}

    <div className="rounded-box border border-hairline bg-base-100 p-5">
      {children}
    </div>

    {footer && (
      <div className="mt-3 text-center text-sm text-base-content/60">
        {footer}
      </div>
    )}
  </div>
);

export default FormPanel;
