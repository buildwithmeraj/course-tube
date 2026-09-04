import { notFound } from "next/navigation";
import CourseVideos from "@/components/pages/courses/CourseVideos";
import { loadWatchPage } from "@/lib/watchPage";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const data = await loadWatchPage(id);

  return {
    title: data?.course?.title || "Course Videos",
    description: data?.course?.title
      ? `Watch ${data.course.title} on ${process.env.SITE_NAME}.`
      : `All videos of a course at ${process.env.SITE_NAME}.`,
  };
}

const page = async ({ params }) => {
  const { id } = await params;
  const data = await loadWatchPage(id);

  if (!data) notFound();

  return (
    <CourseVideos initialCourse={data.course} initialVideos={data.videos} />
  );
};

export default page;
