import { Cabin, Figtree, Nunito_Sans, Poltawski_Nowy } from "next/font/google";
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
        className={`${FigtreeFont.variable} antialiased flex flex-col min-h-screen overflow-x-hidden`}
      >
        <SpeedInsights />
        <Providers>
          <header>
            <nav>
              <Navbar />
            </nav>
          </header>
          <main className="container mx-auto mt-20 px-4 mb-6 lg:mb-4 flex-1">
            {children}
          </main>
          <Toaster position="bottom-center" reverseOrder={false} />
          <footer>
            <Footer />
            <Dock />
          </footer>
        </Providers>
      </body>
    </html>
  );
}
