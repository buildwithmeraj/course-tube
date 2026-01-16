import React from "react";
import Icon from "../utilities/Icon";
import "animate.css";

const Loading = () => {
  return (
    <div className="flex items-center justify-center h-dvh">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Icon
          width={128}
          height={128}
          classes="animate__animated animate__pulse animate__infinite"
        />
      </div>
    </div>
  );
};

export default Loading;
