import React, { useEffect, useState } from "react";
import { BiSolidTimeFive } from "react-icons/bi";
import { FaFolderOpen, FaVideo } from "react-icons/fa6";
import { HiUserGroup } from "react-icons/hi";
import { RiGraduationCapFill } from "react-icons/ri";

const Stats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        if (mounted) setStats(data);
      })
      .catch(() => {
        if (mounted) setStats(null);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 my-3">
        <h2 className="col-span-full text-center">Statistics</h2>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="p-4 bg-primary/30 rounded-lg animate-pulse h-20"
          />
        ))}
      </div>
    );
  }

  const c = stats || {};
  const seconds = Number(c.totalVideoDurationSeconds || 0);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-center">
      <h2 className="col-span-full text-center">Statistics</h2>
      <div className="p-4 bg-primary/30 rounded-lg text-center shadow-sm hover:shadow-md relative">
        <div className="text-sm text-muted">Categories</div>
        <div className="text-3xl font-bold">{c.categoriesCount ?? 0}</div>
        <div className="absolute top-2 left-2 text-base-content/50">
          <FaFolderOpen size={36} />
        </div>
      </div>

      <div className="p-4 bg-primary/30 rounded-lg text-center shadow-sm hover:shadow-md relative">
        <div className="text-sm text-muted">Courses</div>
        <div className="text-3xl font-bold">{c.coursesCount ?? 0}</div>
        <div className="absolute top-2 left-2 text-base-content/50">
          <RiGraduationCapFill size={36} />
        </div>
      </div>

      <div className="p-4 bg-primary/30 rounded-lg text-center shadow-sm hover:shadow-md relative">
        <div className="text-sm text-muted">Enrolls</div>
        <div className="text-3xl font-bold">{c.enrollsCount ?? 0}</div>
        <div className="absolute top-2 left-2 text-base-content/50">
          <HiUserGroup size={36} />
        </div>
      </div>

      <div className="p-4 bg-primary/30 rounded-lg text-center shadow-sm hover:shadow-md relative">
        <div className="text-sm text-muted">Videos</div>
        <div className="text-3xl font-bold">{c.videosCount ?? 0}</div>
        <div className="absolute top-2 left-2 text-base-content/50">
          <FaVideo size={36} />
        </div>
      </div>

      <div className="p-4 bg-primary/30 rounded-lg text-center shadow-sm hover:shadow-md relative col-span-full md:col-span-2 lg:col-span-1">
        <div className="text-sm text-muted">Total Duration</div>
        <div className="text-3xl font-bold">
          {hours}h {minutes}m
        </div>
        <div className="absolute top-2 left-2 text-base-content/50">
          <BiSolidTimeFive size={36} />
        </div>
      </div>
    </div>
  );
};

export default Stats;
