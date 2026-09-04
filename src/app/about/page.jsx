import React from "react";
import Link from "next/link";
import { FaCheck } from "react-icons/fa6";
import { IoMdMail } from "react-icons/io";

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

const differences = [
  {
    title: "Accessibility",
    body: "Anyone should be able to learn from quality content without a paywall.",
  },
  {
    title: "Quality",
    body: "Public courses are reviewed before approval, so the catalogue stays cleaner and easier to browse.",
  },
  {
    title: "Community",
    body: "Anyone can submit playlists they find useful, which grows the catalogue with practical recommendations.",
  },
  {
    title: "Progress",
    body: "Progress tracking makes long playlists feel manageable, even when you return later from another device.",
  },
];

const involvement = [
  ["Submit a course", "Found a good YouTube playlist? Submit it for review."],
  ["Give feedback", "Tell us what feels confusing, missing or worth improving."],
  ["Spread the word", "Point other learners at free resources worth their time."],
];

// A document that still fills the page. Prose is capped to a readable measure,
// but the structural blocks — the checklist, the cards — span the full content
// width, so the page uses its space instead of stranding one narrow column on
// the left of an empty screen.
export default function AboutPage() {
  return (
    <article className="doc space-y-12">
      <header>
        <h1 className="page-title mb-2">About {process.env.SITE_NAME}</h1>
        <p className="lede">
          {process.env.SITE_NAME} turns scattered YouTube playlists into
          structured learning paths. It is built for people who want a simple
          way to discover courses, track progress, and keep learning without
          paying for another subscription.
        </p>
      </header>

      {/* The prose column is fixed at a readable measure and the checklist
          takes whatever is left, so neither one is stretched or stranded. */}
      <div className="grid gap-x-14 gap-y-12 lg:grid-cols-[minmax(0,32rem)_minmax(0,1fr)]">
        <section>
          <h2 className="section-title">Mission</h2>
          <p>
            Make free learning feel organised. We take good playlists from
            YouTube and present them in a course format that is easier to
            follow, revisit and complete — so the focus stays on the content
            itself rather than on jumping between tabs, losing track of
            progress, or hunting for the next video.
          </p>
          <p>
            Playlists play from YouTube, so creators keep ownership and their
            view counts. {process.env.SITE_NAME} hosts nothing.
          </p>
        </section>

        <section>
          <h2 className="section-title">What you get</h2>
          <ul className="grid list-none gap-x-8 gap-y-2 pl-0 sm:grid-cols-2">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm">
                <FaCheck
                  size={11}
                  className="mt-1.5 shrink-0 text-success"
                  aria-hidden="true"
                />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section>
        <h2 className="section-title">What makes it different</h2>
        <dl className="grid gap-px overflow-hidden rounded-box border border-hairline bg-hairline sm:grid-cols-2 xl:grid-cols-4">
          {differences.map(({ title, body }) => (
            <div key={title} className="bg-base-100 p-4">
              <dt className="card-heading">{title}</dt>
              <dd className="mt-1 text-sm text-base-content/70">{body}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h2 className="section-title">Get involved</h2>
        <dl className="grid gap-x-10 gap-y-3 sm:grid-cols-3">
          {involvement.map(([title, body]) => (
            <div key={title} className="text-sm">
              <dt className="card-heading">{title}</dt>
              <dd className="mt-1 text-base-content/70">{body}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h2 className="section-title">Contact</h2>
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-box border border-hairline bg-base-100 p-5">
          <p>Questions, feedback or partnership enquiries are welcome.</p>
          <Link href="/contact" className="btn btn-primary btn-sm">
            <IoMdMail size={14} />
            Contact us
          </Link>
        </div>
      </section>
    </article>
  );
}
