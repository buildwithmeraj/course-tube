import Image from "next/image";
import Link from "next/link";
import React from "react";
import { RiPlayList2Fill, RiGraduationCapFill } from "react-icons/ri";
import { HiUserGroup } from "react-icons/hi";

const PlaylistCard = ({ playlist }) => {
  return (
    <div className="rounded-lg">
      <Link href={`/courses/${playlist._id}`}>
        <div className="stack w-full">
          <div className="relative group">
            <Image
              src={playlist.thumbnailUrl}
              alt={playlist.title}
              width={0}
              height={0}
              sizes="100vw"
              className="w-full rounded-xl"
            />
            <div
              className="absolute inset-0 flex items-center justify-center
                  bg-black/40 text-white text-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
            >
              <RiPlayList2Fill size={56} />
            </div>
            {playlist.enrollCount >= 0 && (
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded flex items-center gap-1">
                <HiUserGroup size={15} />
                {playlist.enrollCount} Enrolls
              </div>
            )}
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded flex items-center gap-1">
              <RiGraduationCapFill size={15} />
              {playlist.totalCount} Videos
            </div>
          </div>
          <div className="card shadow-md bg-accent"></div>
          <div className="card shadow-md bg-accent/70"></div>
        </div>
      </Link>
      <h3 className="card-title mt-2">
        <Link href={`/courses/${playlist._id}`}>{playlist.title}</Link>
      </h3>
    </div>
  );
};

export default PlaylistCard;
