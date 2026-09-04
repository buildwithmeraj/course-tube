import { Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/shared/AppShell";
import Providers from "./providers/Providers";
import { Toaster } from "react-hot-toast";
import { SpeedInsights } from "@vercel/speed-insights/next";

const UiFont = Archivo({
  subsets: ["latin"],
  variable: "--font-ui",
  fallback: ["system-ui", "sans-serif"],
});

// Every duration, count and timestamp. Tabular figures matter here: the video
// list is a column of numbers that should line up.
const MonoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  fallback: ["ui-monospace", "monospace"],
});

export const metadata = {
  title: {
    template: "%s | " + process.env.SITE_NAME,
    default: process.env.SITE_NAME,
  },
  description:
    "Complete courses directly from youtube playlists while keeping track of progresses in an organized way.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${UiFont.variable} ${MonoFont.variable} antialiased overflow-x-hidden`}
      >
        <SpeedInsights />
        <Providers>
          <AppShell>{children}</AppShell>
          <Toaster
            position="bottom-center"
            reverseOrder={false}
            containerStyle={{ bottom: "1rem" }}
          />
        </Providers>
      </body>
    </html>
  );
}
