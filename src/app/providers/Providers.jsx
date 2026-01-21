"use client";
import React from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { SearchProvider } from "../contexts/SearchContext";

const Providers = ({ children }) => {
  return (
    <SessionProvider>
      <ThemeProvider attribute="data-theme">
        <SearchProvider>{children}</SearchProvider>
      </ThemeProvider>
    </SessionProvider>
  );
};

export default Providers;
