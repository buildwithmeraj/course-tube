import Profile from "@/components/pages/private/Profile";
import React from "react";
export const metadata = {
  title: "Profile",
  description: `Profile page of ${process.env.SITE_NAME}. `,
};
const page = () => {
  return <Profile />;
};

export default page;
