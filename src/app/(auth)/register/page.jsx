import RegisterPage from "@/components/pages/auth/Register";
import React from "react";
export const metadata = {
  title: `Register | ${process.env.SITE_NAME}`,
  description: `Register page of ${process.env.SITE_NAME}. Register to keep track of your progresses.`,
};
const page = () => {
  return <RegisterPage />;
};

export default page;
