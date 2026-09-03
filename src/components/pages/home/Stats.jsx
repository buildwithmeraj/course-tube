import React from "react";
import { BiSolidTimeFive } from "react-icons/bi";
import { FaFolderOpen, FaVideo } from "react-icons/fa6";
import { HiUserGroup } from "react-icons/hi";
import { RiGraduationCapFill } from "react-icons/ri";
import { getPlatformStats } from "@/lib/queries";

const Stats = async () => {
  const c = await getPlatformStats();

  const seconds = Number(c.totalVideoDurationSeconds || 0);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-center mt-6 backdrop-blur-md">
      <h2 className="col-span-full text-center backdrop-blur-none">
        Platform snapshot
      </h2>
      <div className="p-4 bg-primary/30 rounded-lg text-center shadow-sm hover:shadow-md relative">
        <div className="text-sm text-muted">Categories</div>
        <div className="text-3xl font-bold">{c.categoriesCount ?? 0}</div>
        <div className="absolute top-7 left-10 text-base-content/60">
          <FaFolderOpen size={36} />
        </div>
      </div>

      <div className="p-4 bg-primary/30 rounded-lg text-center shadow-sm hover:shadow-md relative">
        <div className="text-sm text-muted">Courses</div>
        <div className="text-3xl font-bold">{c.coursesCount ?? 0}</div>
        <div className="absolute top-7 left-10 text-base-content/60">
          <RiGraduationCapFill size={36} />
        </div>
      </div>

      <div className="p-4 bg-primary/30 rounded-lg text-center shadow-sm hover:shadow-md relative">
        <div className="text-sm text-muted">Enrolls</div>
        <div className="text-3xl font-bold">{c.enrollsCount ?? 0}</div>
        <div className="absolute top-7 left-10 text-base-content/60">
          <HiUserGroup size={36} />
        </div>
      </div>

      <div className="p-4 bg-primary/30 rounded-lg text-center shadow-sm hover:shadow-md relative">
        <div className="text-sm text-muted">Videos</div>
        <div className="text-3xl font-bold">{c.videosCount ?? 0}</div>
        <div className="absolute top-7 left-10 text-base-content/60">
          <FaVideo size={36} />
        </div>
      </div>

      <div className="p-4 bg-primary/30 rounded-lg text-center shadow-sm hover:shadow-md relative col-span-full md:col-span-2 lg:col-span-1">
        <div className="text-sm text-muted">Total Duration</div>
        <div className="text-3xl font-bold">
          {hours}h {minutes}m
        </div>
        <div className="absolute top-7 left-10 text-base-content/60">
          <BiSolidTimeFive size={36} />
        </div>
      </div>
    </div>
  );
};

export default Stats;
