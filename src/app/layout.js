import { Bricolage_Grotesque, Figtree } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import Providers from "./providers/Providers";
import { Toaster } from "react-hot-toast";
import Dock from "@/components/shared/Dock";
import { SpeedInsights } from "@vercel/speed-insights/next";

const FigtreeFont = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  fallback: ["system-ui", "sans-serif"],
});

// Headings only. Figtree is an even geometric sans and reads the same at every
// size; the display face gives the type scale somewhere to actually go.
const DisplayFont = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  fallback: ["system-ui", "sans-serif"],
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
        className={`${FigtreeFont.variable} ${DisplayFont.variable} antialiased flex flex-col min-h-screen overflow-x-hidden`}
      >
        <SpeedInsights />
        <Providers>
          <header>
            <nav>
              <Navbar />
            </nav>
          </header>
          <main className="container mx-auto flex-1 px-4 pt-[calc(var(--nav-h)+1.5rem)] pb-6 lg:pb-4">
            {children}
          </main>
          <Toaster
            position="bottom-center"
            reverseOrder={false}
            containerStyle={{ bottom: "calc(var(--dock-offset) + 1rem)" }}
          />
          <footer>
            <Footer />
            <Dock />
          </footer>
        </Providers>
      </body>
    </html>
  );
}
