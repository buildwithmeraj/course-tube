import CategoryList from "@/components/pages/categoreis/CategoryList";
import React from "react";
export const metadata = {
  title: "Categories",
  description: `All courses categories of ${process.env.SITE_NAME}. `,
};

export const revalidate = 3600;

const page = () => {
  return <CategoryList />;
};

export default page;
