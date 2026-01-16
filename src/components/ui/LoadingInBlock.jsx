import React from "react";
import Icon from "../utilities/Icon";
import "animate.css";

const LoadingInBlock = () => {
  return (
    <div className="flex items-center justify-center">
      <Icon
        width={128}
        height={128}
        classes="animate__animated animate__pulse animate__infinite"
      />
    </div>
  );
};

export default LoadingInBlock;
