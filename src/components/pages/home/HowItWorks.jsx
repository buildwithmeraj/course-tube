import React from "react";
import { FaYoutube, FaList, FaPlusCircle, FaClock } from "react-icons/fa";

const HowItWorks = () => {
  const steps = [
    {
      icon: FaYoutube,
      title: "YouTube Playlists",
      description:
        "We surface playlists hosted on YouTube — CourseTube does not host videos. Playlists play from YouTube so creators keep ownership and playback stays authentic.",
    },
    {
      icon: FaList,
      title: "Curated Categories",
      description:
        "Browse a thoughtfully organized collection of categories where popular and trending courses are grouped for easy discovery.",
    },
    {
      icon: FaPlusCircle,
      title: "Add Your Playlist",
      description:
        "Submit any YouTube playlist to your library. Submissions are private to you until an admin approves them for public listing.",
    },
    {
      icon: FaClock,
      title: "Track & Learn",
      description:
        "Watch anytime — we track progress, organize watched content, and help you pick up where you left off for a smoother learning experience.",
    },
  ];

  return (
    <div className="mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-4xl font-bold mb-2">How CourseTube Works</h2>
        <p className="text-lg text-base-content/70">
          Learn from YouTube playlists, organized and tracked for your progress.
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
