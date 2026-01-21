"use client";
import { createContext, useContext, useState } from "react";

const SearchContext = createContext(null);

export const useSearch = () => useContext(SearchContext);

export function SearchProvider({ children }) {
  const [showSearchModal, setShowSearchModal] = useState(false);

  return (
    <SearchContext.Provider value={{ showSearchModal, setShowSearchModal }}>
      {children}
    </SearchContext.Provider>
  );
}
