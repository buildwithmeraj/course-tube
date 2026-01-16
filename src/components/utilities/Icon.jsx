import Image from "next/image";
import React from "react";

const Icon = ({ classes, width, height }) => {
  return (
    <>
      <Image
        src="/icon.svg"
        alt="Icon"
        className={classes}
        width={width}
        height={height}
        sizes="100vw"
      />
    </>
  );
};

export default Icon;
