import HomePage from "../components/pages/home/Home";
export const metadata = {
  title: `Home Page | ${process.env.SITE_NAME}`,
  description:
    "Complete courses directly from youtube playlists while keeping track of progresses in an organized way.",
};

export default function Home() {
  return <HomePage />;
}
