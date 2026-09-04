import React from "react";
import Icon from "./Icon";

// `compact` keeps only the mark, for the collapsed rail.
const Logo = ({ compact = false }) => {
  return (
    <div className="flex items-center gap-2 text-lg font-bold tracking-tight">
      <Icon height={26} width={26} />
      <span className={compact ? "hidden truncate xl:inline" : "truncate"}>
        {process.env.NEXT_PUBLIC_SITE_NAME}
      </span>
    </div>
  );
};

export default Logo;
