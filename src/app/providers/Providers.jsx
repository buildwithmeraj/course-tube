"use client";
import React from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";

const Providers = ({ children }) => {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="data-theme"
        defaultTheme="system"
        enableSystem
        suppressHydrationWarning
      >
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
};

export default Providers;
