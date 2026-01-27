import React from "react";
import Link from "next/link";
import { FaCheckCircle } from "react-icons/fa";
import { IoMdMail } from "react-icons/io";
export const metadata = {
  title: `About | ${process.env.SITE_NAME}`,
  description: `Know more about ${process.env.SITE_NAME}. `,
};

const features = [
  "YouTube Playlist Integration - Access curated playlists directly from YouTube",
  "Progress Tracking - Monitor your learning journey with detailed progress analytics",
  "Organized Categories - Discover courses organized by topic and skill level",
  "Community Features - Connect with other learners and share your progress",
  "Free Forever - All courses are completely free, no hidden charges",
  "Responsive Design - Learn on any device - desktop, tablet, or mobile",
];

export default function AboutPage() {
  return (
    <>
      <section>
        <h2 className="text-center">About CourseTube</h2>
        <p className="lead">
          CourseTube is a revolutionary learning platform that curates
          high-quality playlist-based courses from YouTube and makes them easy
          to follow. We believe learning should be accessible, structured, and
          completely free.
        </p>
      </section>

      <div className="flex items-center gap-4 flex-col lg:flex-row my-3">
        <section className="w-full lg:w-1/2">
          <h2 className="text-center">Our Mission</h2>
          <p>
            Make learning accessible and structured — turning scattered videos
            into cohesive courses with progress tracking and community features.
          </p>
          <p>
            We are committed to democratizing education by leveraging the vast
            library of quality content on YouTube and organizing it in a way
            that helps learners achieve their goals efficiently.
          </p>
        </section>

        <section className="w-full lg:w-1/2">
          <h2 className="text-center">Our Vision</h2>
          <p>
            To create a world where quality education is accessible to everyone,
            regardless of their economic background or geographical location.
          </p>
          <p>
            We envision a future where learning is structured, engaging, and
            empowering for millions of students worldwide.
          </p>
        </section>
      </div>

      <section>
        <h2 className="text-center">Why Choose CourseTube?</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <FaCheckCircle className="text-success mt-1 shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="my-3">
        <h2 className="text-center">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-primary/10 rounded-lg">
            <h3 className="font-bold mb-2">Accessibility</h3>
            <p className="text-sm">
              Education should be free and available to everyone, everywhere.
            </p>
          </div>
          <div className="p-4 bg-info/10 rounded-lg">
            <h3 className="font-bold mb-2">Quality</h3>
            <p className="text-sm">
              We curate only the best content from trusted educators and
              creators.
            </p>
          </div>
          <div className="p-4 bg-success/10 rounded-lg">
            <h3 className="font-bold mb-2">Community</h3>
            <p className="text-sm">
              Learning together strengthens our resolve to help each other grow.
            </p>
          </div>
          <div className="p-4 bg-warning/10 rounded-lg">
            <h3 className="font-bold mb-2">Innovation</h3>
            <p className="text-sm">
              We continuously improve our platform to enhance the learning
              experience.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-center">Get Involved</h2>
        <p className="mb-3 underline font-semibold">
          We are always looking for ways to improve CourseTube. Here is how you
          can help:
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          <div>
            <strong>Submit a Course:</strong> Found a great YouTube playlist?
            Submit it for admin approval.
          </div>
          <div>
            <strong>Provide Feedback:</strong> Help us improve by sharing your
            thoughts and suggestions.
          </div>
          <div>
            <strong>Become an Ambassador:</strong> Help spread the word about
            quality free education.
          </div>
          <div>
            <strong>Share Content:</strong> Share our platforms to other
            learners. Let them also learn what you learned.
          </div>
        </div>
      </section>

      <section className="my-3">
        <h2 className="text-center">Contact & Support</h2>
        <p className="mb-3">
          Have questions, feedback, or partnership inquiries? We would love to
          hear from you!
        </p>
        <p>
          For partnerships or support or any queries:{" "}
          <Link href="/contact" className="btn btn-primary btn-sm">
            <IoMdMail />
            Contact US
          </Link>
        </p>
      </section>
    </>
  );
}
