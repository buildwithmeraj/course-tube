import CategoryDetails from "@/components/pages/categoreis/CategoryDetails";
import React from "react";
export const metadata = {
  title: "Category Courses",
  description: `All category courses of ${process.env.SITE_NAME}. `,
};
const page = () => {
  return <CategoryDetails />;
};

export default page;
