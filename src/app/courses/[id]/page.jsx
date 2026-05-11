import CourseDetails from "@/components/pages/courses/CourseDetails";
import React from "react";
export const metadata = {
  title: "Course Details",
  description: `All videos of a category at ${process.env.SITE_NAME}. `,
};
const page = () => {
  return <CourseDetails />;
};

export default page;
