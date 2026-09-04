import React from "react";

// One tile of the dashboard bento. `span` lets a tile claim more of the grid
// when its figure deserves the room, rather than every tile being equal.
const StatTile = ({ label, value, hint, icon: Icon, span = "", children }) => (
  <div
    className={`rounded-box border border-hairline bg-base-100 p-4 ${span}`}
  >
    <div className="flex items-center gap-2">
      {Icon && <Icon size={13} className="text-base-content/40" />}
      <p className="eyebrow">{label}</p>
    </div>
    {value !== undefined && (
      <p className="figure-text mt-1 text-2xl font-bold tracking-tight">
        {value}
      </p>
    )}
    {hint && <p className="mt-0.5 text-xs text-base-content/60">{hint}</p>}
    {children}
  </div>
);

export default StatTile;
