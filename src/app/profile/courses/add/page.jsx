import AddCourse from "@/components/pages/private/AddCourse";
import React from "react";
export const metadata = {
  title: `Add a Course | ${process.env.SITE_NAME}`,
  description: `Add a course at ${process.env.SITE_NAME}. `,
};
const page = () => {
  return <AddCourse />;
};

export default page;
