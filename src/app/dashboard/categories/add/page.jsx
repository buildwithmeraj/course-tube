import AddCategory from "@/components/pages/private/AddCategory";
import React from "react";
export const metadata = {
  title: `Add Category | ${process.env.SITE_NAME}`,
  description: `Add category at ${process.env.SITE_NAME}. `,
};
const page = () => {
  return <AddCategory />;
};

export default page;
