import EnrolledCourses from "@/components/pages/private/EnrolledCourses";
import React from "react";
export const metadata = {
  title: "Enrolled Courses",
  description: `All courses enrolled by you. `,
};
const page = () => {
  return <EnrolledCourses />;
};

export default page;
