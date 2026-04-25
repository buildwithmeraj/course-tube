import React from "react";
import { FaYoutube, FaList, FaPlusCircle, FaClock } from "react-icons/fa";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "CourseTube";

const HowItWorks = () => {
  const steps = [
    {
      icon: FaYoutube,
      title: "Find a playlist",
      description: `We surface playlists hosted on YouTube — ${siteName} does not host videos. Playlists play from YouTube so creators keep ownership and playback stays authentic.`,
    },
    {
      icon: FaList,
      title: "Browse by topic",
      description:
        "Use categories to jump straight into the topics that matter most, from beginner-friendly paths to more advanced courses.",
    },
    {
      icon: FaPlusCircle,
      title: "Submit your own",
      description:
        "Add a YouTube playlist to your library. Submissions stay private until an admin reviews and approves them.",
    },
    {
      icon: FaClock,
      title: "Keep your progress",
      description:
        "Watch when you have time, track what is completed, and pick up exactly where you left off on any device.",
    },
  ];

  return (
    <div className="mx-auto">
      <div className="text-center mb-6 mt-2">
        <h2 className="text-4xl font-bold mb-2">How {siteName} works</h2>
        <p className="text-lg text-base-content/70">
          A simple workflow that turns public playlists into structured,
          trackable learning.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={index}
              className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="card-body text-center">
                <div className="flex justify-center mb-4">
                  <Icon className="text-4xl text-primary" />
                </div>
                <h3 className="card-title justify-center text-xl mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-base-content/70">
                  {step.description}
                </p>
                <div className="badge badge-primary mt-4">Step {index + 1}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HowItWorks;
