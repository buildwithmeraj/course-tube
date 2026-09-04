import CTA from "@/components/pages/home/CTA";
import Hero from "@/components/pages/home/Hero";
import HowItWorks from "@/components/pages/home/HowItWorks";
import PopularCourses from "@/components/pages/home/PopularCourses";
import Stats from "@/components/pages/home/Stats";
import FeaturedCategories from "./FeaturedCategories";
import ContinueLearning from "@/components/ui/ContinueLearning";

export default function HomePage() {
  return (
    <>
      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-surface/65 -mt-6">
        <Hero />
      </section>
      <div className="mt-10 space-y-14">
        <ContinueLearning />
        <HowItWorks />
        <PopularCourses />
        <FeaturedCategories />
        <Stats />
        <CTA />
      </div>
    </>
  );
}
