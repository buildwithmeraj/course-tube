import React from "react";
import Link from "next/link";
import { FaCheckCircle } from "react-icons/fa";
import { IoMdMail } from "react-icons/io";
import { FaUnlock } from "react-icons/fa6";
import { GrStatusGood } from "react-icons/gr";
import { RiCommunityLine } from "react-icons/ri";
import { GoNorthStar } from "react-icons/go";
export const metadata = {
  title: "About",
  description: `Learn how ${process.env.SITE_NAME} turns YouTube playlists into structured courses with progress tracking and admin review.`,
};

const features = [
  "Curated YouTube playlists turned into structured courses",
  "Progress tracking so learners can resume from where they stopped",
  "Admin review that keeps public courses organized and moderated",
  "Categories that make it easier to find courses by topic",
  "Free access with no subscription or hidden fee",
  "Responsive design that works on desktop, tablet, and mobile",
];

export default function AboutPage() {
  return (
    <div className="space-y-10">
      <section>
        <h1 className="page-title text-accent text-center">
          About {process.env.SITE_NAME}
        </h1>
        <p className="lede">
          {process.env.SITE_NAME} helps turn scattered YouTube playlists into
          structured learning paths. It is built for people who want a simple
          way to discover courses, track progress, and keep learning without
          paying for another subscription.
        </p>
      </section>

      <div className="flex items-center gap-4 flex-col lg:flex-row">
        <section className="w-full lg:w-1/2">
          <h2 className="section-title text-center">Our Mission</h2>
          <p>
            Make free learning feel organized. We take high-quality playlists
            from YouTube and present them in a course format that is easier to
            follow, revisit, and complete.
          </p>
          <p>
            The goal is to reduce friction for learners, so the focus stays on
            the content itself, not on jumping between tabs, losing track of
            progress, or searching for the next video.
          </p>
        </section>

        <section className="w-full lg:w-1/2">
          <h2 className="section-title text-center">Our Vision</h2>
          <p>
            Create a lightweight learning hub where anyone can discover, share,
            and manage YouTube-based courses in one place.
          </p>
          <p>
            We want the platform to stay simple, useful, and easy to trust for
            both learners and admins as it grows.
          </p>
        </section>
      </div>

      <section>
        <h2 className="section-title text-center">Why Choose {process.env.SITE_NAME}?</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <FaCheckCircle className="text-success mt-1 shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title text-center">What Makes It Different</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-primary/10 rounded-xl">
            <h3 className="card-heading mb-2">Accessibility</h3>
            <p className="text-sm">
              <FaUnlock className="inline mr-1.5 mb-0.5" />
              Anyone should be able to learn from quality content without a paywall.
            </p>
          </div>
          <div className="p-4 bg-info/10 rounded-xl">
            <h3 className="card-heading mb-2">Quality</h3>
            <p className="text-sm">
              <GrStatusGood className="inline mr-1.5 mb-0.5" />
              Public courses are reviewed before approval so the catalog stays
              cleaner and easier to browse.
            </p>
          </div>
          <div className="p-4 bg-success/10 rounded-xl">
            <h3 className="card-heading mb-2">Community</h3>
            <p className="text-sm">
              <RiCommunityLine className="inline mr-1.5 mb-0.5" />
              Users can submit playlists they find useful, helping the catalog grow
              with practical recommendations.
            </p>
          </div>
          <div className="p-4 bg-warning/10 rounded-xl">
            <h3 className="card-heading mb-2">Progress</h3>
            <p className="text-sm">
              <GoNorthStar className="inline mr-1.5 mb-0.5" />
              Progress tracking makes long playlists feel manageable, even when
              you return later from another device.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="section-title text-center">Get Involved</h2>
        <p className="mb-3 font-semibold">
          We are always looking for ways to improve {process.env.SITE_NAME}.
          Here is how you can help:
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          <div>
            <strong>Submit a Course:</strong> Found a great YouTube playlist?
            Submit it for admin approval.
          </div>
          <div>
            <strong>Provide Feedback:</strong> Share what feels confusing,
            missing, or worth improving.
          </div>
          <div>
            <strong>Become an Ambassador:</strong> Help spread the word about
            quality free learning resources.
          </div>
          <div>
            <strong>Share Content:</strong> Share the platform with other
            learners so they can discover useful courses too.
          </div>
        </div>
      </section>

      <section>
        <h2 className="section-title text-center">Contact & Support</h2>
        <p className="mb-3">
          Have questions, feedback, or partnership inquiries? We would love to
          hear from you.
        </p>
        <p>
          For partnerships, support, or any queries:{" "}
          <Link href="/contact" className="btn btn-primary btn-sm">
            <IoMdMail />
            Contact us
          </Link>
        </p>
      </section>
    </div>
  );
}
