import React from "react";
import Icon from "./Icon";

const Logo = () => {
  return (
    <div className="flex items-center gap-2 text-lg font-bold tracking-tight">
      <Icon height={26} width={26} />
      <span className="truncate">{process.env.NEXT_PUBLIC_SITE_NAME}</span>
    </div>
  );
};

export default Logo;
