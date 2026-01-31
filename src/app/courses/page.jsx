import CoursesList from "@/components/pages/courses/CourseList";
import React from "react";
export const metadata = {
  title: `Courses List | ${process.env.SITE_NAME}`,
  description: `List of all courses at ${process.env.SITE_NAME}. `,
};
const page = () => {
  return <CoursesList />;
};

export default page;
