import HomePage from "../components/pages/home/Home";
export const metadata = {
  title: `${process.env.SITE_NAME} - Learn Smarter`,
  description:
    "Complete courses directly from youtube playlists while keeping track of progresses in an organized way.",
};

export default function Home() {
  return <HomePage />;
}
