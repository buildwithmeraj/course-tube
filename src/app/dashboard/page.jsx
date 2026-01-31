import Dashboard from "@/components/pages/private/Dashboard";
import React from "react";
export const metadata = {
  title: `Dashboard | ${process.env.SITE_NAME}`,
  description: `Admin Dashboard at ${process.env.SITE_NAME}. `,
};
const page = () => {
  return <Dashboard />;
};

export default page;
