import React from "react";
import Icon from "../utilities/Icon";

const Loading = () => {
  return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Icon
          width={128}
          height={128}
          classes="motion-safe:animate-pulse"
        />
      </div>
    </div>
  );
};

export default Loading;
