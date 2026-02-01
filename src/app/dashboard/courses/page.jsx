import ManageCourses from "@/components/pages/private/ManageCourses";
import React from "react";
export const metadata = {
  title: `Dashboard | ${process.env.SITE_NAME}`,
  description: `Admin Dashboard at ${process.env.SITE_NAME}. `,
};
const page = () => {
  return <ManageCourses />;
};

export default page;
