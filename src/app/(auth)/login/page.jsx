import LoginPage from "@/components/pages/auth/Login";
import React from "react";
export const metadata = {
  title: `Login | ${process.env.SITE_NAME}`,
  description: `Login page of ${process.env.SITE_NAME}. Login to keep track of your progresses.`,
};
const page = () => {
  return <LoginPage />;
};

export default page;
