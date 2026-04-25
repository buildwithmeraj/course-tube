import Image from "next/image";
import Link from "next/link";
import React from "react";
import { BsFillHandIndexThumbFill } from "react-icons/bs";
import { FaPlay } from "react-icons/fa6";
import "animate.css";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "CourseTube";

const Hero = () => {
  return (
    <div className="hero min-h-90 max-w-screen backdrop-blur-md">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <Image
          src="/hero.svg"
          alt="Hero Image"
          width={450}
          height={450}
          sizes="100vw"
          className="animate__animated animate__pulse animate__slow animate__infinite"
        />
        <div>
          <h1 className="text-4xl font-bold">Learn smarter with {siteName}</h1>
          <p className="py-2 text-lg">
            Turn scattered YouTube playlists into organized courses you can
            actually finish. Track progress, resume anytime, and keep every
            course in one place.
          </p>

          <div className="py-2">
            <h2 className="text-2xl font-semibold mb-1">Why choose us?</h2>
            <p className="py-2">
              {siteName} is built for focused learning. You get curated
              playlists, progress tracking, category-based discovery, and a
              simple approval workflow that keeps the public catalog organized.
            </p>
          </div>

          <div className="text-xl text-center py-4 mx-4 border-base-content/60 border-2 border-dashed rounded-xl">
            <BsFillHandIndexThumbFill className="inline rotate-90 mr-2 mb-1 text-amber-500" />
            It is time to{" "}
            <span className="text-rotate">
              <span className="font-bold">
                <span>
                  <span className="bg-success p-2 rounded-lg text-white">
                    Start
                  </span>
                </span>
                <span>
                  <span className="bg-info p-2 rounded-lg text-white">
                    Organize
                  </span>
                </span>
                <span>
                  <span className="bg-error p-2 rounded-lg text-white">
                    Progress
                  </span>
                </span>
                <span>
                  <span className="bg-info p-2 rounded-lg text-white">
                    Resume
                  </span>
                </span>
                <span>
                  <span className="bg-accent p-2 rounded-lg text-white">
                    Learn
                  </span>
                </span>
                <span>
                  <span className="bg-error p-2 rounded-lg text-white">
                    Finish
                  </span>
                </span>
              </span>
            </span>
          </div>

          <div className="text-center pt-4">
            <Link className="btn btn-accent hover:btn-accent" href="/courses">
              <FaPlay />
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
