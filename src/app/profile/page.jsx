import Profile from "@/components/pages/private/Profile";
import React from "react";
export const metadata = {
  title: `Profile | ${process.env.SITE_NAME}`,
  description: `Profile page of ${process.env.SITE_NAME}. `,
};
const page = () => {
  return <Profile />;
};

export default page;
