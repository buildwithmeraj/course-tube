import React from "react";

const PlaylistCard = ({ playlist }) => {
  return (
    <div className="border border-gray-300 rounded-lg p-4">
      <img
        src={playlist.thumbnailUrl}
        alt={playlist.title}
        className="w-full h-48 object-cover rounded-md"
      />
      <h3 className="font-semibold mt-2">{playlist.title}</h3>
      <p className="text-sm text-gray-600">{playlist.channelTitle}</p>
    </div>
  );
};

export default PlaylistCard;
