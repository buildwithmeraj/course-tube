import CategoryDetails from "@/components/pages/categoreis/CategoryDetails";
import React from "react";
export const metadata = {
  title: `Category Courses | ${process.env.SITE_NAME}`,
  description: `All category courses of ${process.env.SITE_NAME}. `,
};
const page = () => {
  return <CategoryDetails />;
};

export default page;
