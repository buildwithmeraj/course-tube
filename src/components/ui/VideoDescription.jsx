"use client";
import React from "react";

// Renders the YouTube description, linkifying bare URLs. The panel chrome
// belongs to the tab strip that hosts it, not here.
const VideoDescription = ({ description, loading = false }) => {
  const parseDescription = (text) => {
    if (!text) return null;

    // Splitting needs the global flag; testing must not share its lastIndex
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const isUrl = (value) => /^https?:\/\/[^\s]+$/.test(value);

    return text.split("\n").map((line, lineIndex) => {
      const parts = line.split(urlRegex);

      return (
        <div key={lineIndex}>
          {parts.map((part, partIndex) => {
            if (isUrl(part)) {
              return (
                <a
                  key={partIndex}
                  href={part}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-primary hover:underline"
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

  if (loading) {
    return <span className="loading loading-dots loading-sm" />;
  }

  return (
    <div className="text-sm">
      {description ? (
        parseDescription(description)
      ) : (
        <span className="text-base-content/60">
          This video has no description.
        </span>
      )}
    </div>
  );
};

export default VideoDescription;
