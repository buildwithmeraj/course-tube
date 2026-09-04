import { Suspense } from "react";
import SearchResults from "@/components/pages/search/SearchResults";

export const metadata = {
  title: "Search",
  description: `Search courses and video titles on ${process.env.SITE_NAME}.`,
};

const SearchPage = () => (
  <Suspense fallback={null}>
    <SearchResults />
  </Suspense>
);

export default SearchPage;
