import CategoryDetails from "@/components/pages/categoreis/CategoryDetails";
import React from "react";
import { listCategories } from "@/lib/queries";
export const metadata = {
  title: "Category Courses",
  description: `All category courses of ${process.env.SITE_NAME}. `,
};
// Public catalogue data changes rarely; serve it cached and revalidate hourly
export const revalidate = 3600;

// Prerender the categories that exist; new ones render on first request
export async function generateStaticParams() {
  const categories = await listCategories();
  return categories.map((category) => ({ id: category._id.toString() }));
}

const page = async ({ params }) => {
  const { id } = await params;
  return <CategoryDetails id={id} />;
};

export default page;
