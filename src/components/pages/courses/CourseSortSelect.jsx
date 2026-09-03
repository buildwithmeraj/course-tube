"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  { value: "", label: "No Filter" },
  { value: "enrollCount", label: "Total Enrolls" },
  { value: "totalCount", label: "Total Videos" },
  { value: "createdAt", label: "Added Recently" },
  { value: "updatedAt", label: "Updated Recently" },
];

// The sort lives in the URL so the server can render the sorted list, and so a
// sorted view can be linked to or reloaded.
const CourseSortSelect = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onChange = (event) => {
    const params = new URLSearchParams(searchParams);
    if (event.target.value) {
      params.set("sortBy", event.target.value);
    } else {
      params.delete("sortBy");
    }
    router.push(params.size ? `${pathname}?${params}` : pathname);
  };

  return (
    <select
      className="select"
      value={searchParams.get("sortBy") || ""}
      onChange={onChange}
      aria-label="Sort courses"
    >
      {OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default CourseSortSelect;
