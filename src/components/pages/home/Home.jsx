"use client";
import CTA from "@/components/pages/home/CTA";
import Hero from "@/components/pages/home/Hero";
import HowItWorks from "@/components/pages/home/HowItWorks";
import PopularCourses from "@/components/pages/home/PopularCourses";
import Stats from "@/components/pages/home/Stats";

export default function HomePage() {
  return (
    <>
      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-primary/65 -mt-4">
        <Hero />
      </section>
      <HowItWorks />
      <PopularCourses />
      <Stats />
      <CTA />
    </>
  );
}
