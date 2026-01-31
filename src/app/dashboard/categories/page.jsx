import ManageCategories from "@/components/pages/private/ManageCategories";
import React from "react";
export const metadata = {
  title: `Manage Categories | ${process.env.SITE_NAME}`,
  description: `Manage categories at ${process.env.SITE_NAME}. `,
};
const page = () => {
  return <ManageCategories />;
};

export default page;
