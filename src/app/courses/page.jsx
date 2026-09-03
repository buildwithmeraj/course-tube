import CoursesList from "@/components/pages/courses/CourseList";
import React from "react";
export const metadata = {
  title: "Courses List",
  description: `List of all courses at ${process.env.SITE_NAME}. `,
};
export const revalidate = 3600;

const page = async ({ searchParams }) => {
  const { sortBy } = await searchParams;
  return <CoursesList sortBy={sortBy} />;
};

export default page;
