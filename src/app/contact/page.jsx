import ContactPage from "@/components/pages/contact/ContactPage";
export const metadata = {
  title: "Contact",
  description: `Contact page of ${process.env.SITE_NAME}. `,
};
const page = () => {
  return <ContactPage />;
};

export default page;
