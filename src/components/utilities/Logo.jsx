import React from "react";
import Icon from "./Icon";

const Logo = () => {
  return (
    <div className="flex items-center gap-1 text-3xl font-bold">
      <Icon height={50} width={50} /> {process.env.NEXT_PUBLIC_SITE_NAME}
    </div>
  );
};

export default Logo;
