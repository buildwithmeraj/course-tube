import CategoryList from "@/components/pages/categoreis/CategoryList";
import React from "react";
export const metadata = {
  title: `Categories | ${process.env.SITE_NAME}`,
  description: `All courses categories of ${process.env.SITE_NAME}. `,
};

const page = () => {
  return <CategoryList />;
};

export default page;
