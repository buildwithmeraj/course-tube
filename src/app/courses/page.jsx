import getAllPlaylists from "@/actions/server/getAllPlaylists";
import PlaylistCard from "@/components/ui/PlaylistCard";

const Courses = async () => {
  const courses = await getAllPlaylists();
  return (
    <div>
      <h1>All Courses</h1>

      {courses.length === 0 && <p>No enrolled courses</p>}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        {courses.map((item) => (
          <PlaylistCard key={item._id.toString()} playlist={item} />
        ))}
      </div>
    </div>
  );
};

export default Courses;
