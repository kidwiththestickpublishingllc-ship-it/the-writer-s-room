import type { Metadata, Viewport } from "next";
import { Archivo, Courier_Prime, Caveat, Bangers } from "next/font/google";
import "./globals.css";
import QuillChatWidget from "./components/QuillChatWidget";
import WritersTour from "./components/WritersTour";

// Studio fonts. Archivo = headings and buttons, Courier Prime = anything typed,
// Caveat = handwriting, Bangers = comic lettering (artist screens only).
const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", display: "swap" });
const courier = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-courier", display: "swap" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat", display: "swap" });
const bangers = Bangers({ subsets: ["latin"], weight: "400", variable: "--font-bangers", display: "swap" });

export const metadata: Metadata = {
  title: "The Creators Room — The Tiniest Library",
  description: "A home for writers and artists. Publish your stories, earn through Ink, and build your readership on The Tiniest Library.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#234A3D",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${courier.variable} ${caveat.variable} ${bangers.variable}`}>
      <body>
        {children}
        <QuillChatWidget />
        <WritersTour />
      </body>
    </html>
  );
}