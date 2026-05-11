import ManageCourses from "@/components/pages/private/ManageCourses";
import React from "react";
export const metadata = {
  title: "Dashboard",
  description: `Admin Dashboard at ${process.env.SITE_NAME}. `,
};
const page = () => {
  return <ManageCourses />;
};

export default page;
