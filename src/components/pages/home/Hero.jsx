import Image from "next/image";
import Link from "next/link";
import React from "react";
import { BsFillHandIndexThumbFill } from "react-icons/bs";
import { FaPlay } from "react-icons/fa6";
import "animate.css";

const Hero = () => {
  return (
    <div className="hero min-h-90 max-w-screen">
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
          <h1 className="text-4xl font-bold">Welcome to CourseTube</h1>
          <p className="py-2 text-lg">
            Unlock your potential with our curated collection of high-quality
            courses. Learn from industry experts and transform your skills.
          </p>

          <div className="py-2">
            <h2 className="text-2xl font-semibold mb-1">
              Why Choose CourseTube?
            </h2>
            <p className="py-2">
              We believe learning should be accessible, affordable, and
              effective. Our platform combines video-based learning with
              interactive content to keep you engaged every step of the way.
            </p>
          </div>

          <div className="text-xl text-center py-4 mx-4 border-base-content/60 border-2 border-dashed rounded-xl">
            <BsFillHandIndexThumbFill className="inline rotate-90 mr-2 mb-1 text-amber-500" />
            It is time for yourself to{" "}
            <span className="text-rotate">
              <span className="font-bold">
                <span>
                  <span className="bg-success p-2 rounded-lg text-white">
                    Transform
                  </span>
                </span>
                <span>
                  <span className="bg-info p-2 rounded-lg text-white">
                    Elevate
                  </span>
                </span>
                <span>
                  <span className="bg-error p-2 rounded-lg text-white">
                    Accelerate
                  </span>
                </span>
                <span>
                  <span className="bg-info p-2 rounded-lg text-white">
                    Empower
                  </span>
                </span>
                <span>
                  <span className="bg-accent p-2 rounded-lg text-white">
                    Revolutionize
                  </span>
                </span>
                <span>
                  <span className="bg-error p-2 rounded-lg text-white">
                    Unleash
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
