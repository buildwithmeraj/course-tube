import React, { useState } from "react";
import { MdExpandMore, MdExpandLess } from "react-icons/md";
import { BiDetail } from "react-icons/bi";

const VideoDescription = ({ description }) => {
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const parseDescription = (text) => {
    if (!text) return null;

    // URL regex pattern
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    return text.split("\n").map((line, lineIndex) => {
      const parts = line.split(urlRegex);

      return (
        <div key={lineIndex}>
          {parts.map((part, partIndex) => {
            if (urlRegex.test(part)) {
              return (
                <a
                  key={partIndex}
                  href={part}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  {part}
                </a>
              );
            }
            return <span key={partIndex}>{part}</span>;
          })}
        </div>
      );
    });
  };
  return (
    <div className="collapse bg-base-100 border-base-300 border">
      <input
        type="checkbox"
        id="descriptionOpen"
        onChange={(e) => setDescriptionOpen(e.target.checked)}
      />
      <div className="collapse-title font-semibold flex gap-2 items-center">
        <div>
          <BiDetail className="inline mr-1.5 pb-0.5" size={20} />
          Description
        </div>
        <div>
          {descriptionOpen ? (
            <MdExpandLess size={26} />
          ) : (
            <MdExpandMore size={26} />
          )}
        </div>
      </div>
      <div className="collapse-content text-sm">
        {description && parseDescription(description)}
      </div>
    </div>
  );
};

export default VideoDescription;
