"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LANGUAGES } from "@/lib/languages";

// Language lives in the URL alongside sort, so the server renders the filtered
// list and a filtered view can be shared.
const CourseLanguageSelect = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onChange = (event) => {
    const params = new URLSearchParams(searchParams);
    if (event.target.value) {
      params.set("language", event.target.value);
    } else {
      params.delete("language");
    }
    router.push(params.size ? `${pathname}?${params}` : pathname);
  };

  return (
    <select
      className="select"
      value={searchParams.get("language") || ""}
      onChange={onChange}
      aria-label="Filter by language"
    >
      <option value="">All languages</option>
      {LANGUAGES.map((language) => (
        <option key={language.value} value={language.value}>
          {language.label}
        </option>
      ))}
    </select>
  );
};

export default CourseLanguageSelect;
