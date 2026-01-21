import React from "react";
import Link from "next/link";

const team = [
  {
    name: "Alex Johnson",
    role: "Founder & CEO",
    twitter: "https://twitter.com/alex",
  },
  {
    name: "Priya Singh",
    role: "Head of Product",
    twitter: "https://twitter.com/priya",
  },
  {
    name: "Chen Li",
    role: "Lead Engineer",
    twitter: "https://twitter.com/chen",
  },
];

export default function AboutPage() {
  return (
    <main className="prose prose-lg mx-auto py-12 px-4">
      <h1>About CourseTube</h1>
      <p>
        CourseTube curates high-quality playlist-based courses from YouTube and
        makes them easy to follow. Our mission is to help learners discover,
        follow and complete practical video courses.
      </p>

      <section>
        <h2>Our Mission</h2>
        <p>
          Make learning accessible and structured — turning scattered videos
          into cohesive courses with progress tracking and community features.
        </p>
      </section>

      <section>
        <h2>Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {team.map((member) => (
            <div key={member.name} className="p-4 border rounded-md">
              <h3 className="mb-1">{member.name}</h3>
              <p className="text-sm text-muted">{member.role}</p>
              <p className="mt-2">
                <a
                  href={member.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Twitter
                </a>
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          For partnerships or support:{" "}
          <Link
            href="mailto:hello@coursetube.example"
            className="text-primary hover:underline"
          >
            hello@coursetube.example
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
