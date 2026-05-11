import AdminDashboard from "@/components/pages/private/AdminDashboard";
import React from "react";
export const metadata = {
  title: "Dashboard",
  description: `Admin Dashboard at ${process.env.SITE_NAME}. `,
};

const page = () => {
  return <AdminDashboard />;
};

export default page;
