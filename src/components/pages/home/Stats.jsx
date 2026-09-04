import React from "react";
import { BiSolidTimeFive } from "react-icons/bi";
import { FaFolderOpen, FaVideo } from "react-icons/fa6";
import { HiUserGroup } from "react-icons/hi";
import { RiGraduationCapFill } from "react-icons/ri";
import { getPlatformStats } from "@/lib/queries";
import { formatDuration } from "@/lib/duration";

// The icon used to be absolutely positioned at top-7 left-10, which put it
// straight through the number on any tile with a wide value.
const StatTile = ({ icon: Icon, label, value, className = "" }) => (
  <div
    className={`flex items-center gap-3 rounded-xl bg-surface/30 p-4 shadow-sm ${className}`}
  >
    <Icon size={28} className="shrink-0 text-base-content/50" />
    <div className="min-w-0">
      <div className="text-sm text-base-content/60">{label}</div>
      <div className="truncate text-2xl font-bold tabular-nums">{value}</div>
    </div>
  </div>
);

const Stats = async () => {
  const c = await getPlatformStats();

  const tiles = [
    { icon: FaFolderOpen, label: "Categories", value: c.categoriesCount ?? 0 },
    { icon: RiGraduationCapFill, label: "Courses", value: c.coursesCount ?? 0 },
    { icon: HiUserGroup, label: "Enrolls", value: c.enrollsCount ?? 0 },
    { icon: FaVideo, label: "Videos", value: c.videosCount ?? 0 },
  ];

  return (
    <div className="grid grid-cols-2 items-stretch gap-4 md:grid-cols-3 lg:grid-cols-5">
      <h2 className="col-span-full section-title text-center">
        Platform snapshot
      </h2>
      {tiles.map((tile) => (
        <StatTile key={tile.label} {...tile} />
      ))}
      <StatTile
        icon={BiSolidTimeFive}
        label="Total Duration"
        value={formatDuration(Number(c.totalVideoDurationSeconds || 0))}
        className="col-span-full md:col-span-2 lg:col-span-1"
      />
    </div>
  );
};

export default Stats;
