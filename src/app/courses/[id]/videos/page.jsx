import CourseVideos from "@/components/pages/courses/CourseVideos";
import React from "react";
export const metadata = {
  title: `Course Videos | ${process.env.SITE_NAME}`,
  description: `All videos of a courses at ${process.env.SITE_NAME}. `,
};
const page = () => {
  return <CourseVideos />;
};

export default page;
