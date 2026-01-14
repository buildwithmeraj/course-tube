import React from "react";

const VideoCard = ({ video }) => {
  return (
    <div className="border border-gray-300 rounded-lg p-4">
      <img
        src={video.snippet.thumbnails.medium.url}
        alt={video.snippet.title}
        className="w-full h-48 object-cover rounded-md"
      />
      <h3 className="font-semibold mt-2">{video.snippet.title}</h3>
      <p className="text-sm text-gray-600">{video.snippet.channelTitle}</p>
    </div>
  );
};

export default VideoCard;
