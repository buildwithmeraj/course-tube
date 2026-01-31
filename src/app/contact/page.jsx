import ContactPage from "@/components/pages/contact/ContactPage";
import React from "react";
export const metadata = {
  title: `Contact | ${process.env.SITE_NAME}`,
  description: `Contact page of ${process.env.SITE_NAME}. `,
};
const page = () => {
  return <ContactPage />;
};

export default page;
