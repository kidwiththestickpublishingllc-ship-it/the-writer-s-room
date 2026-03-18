import type { Metadata } from "next";
import "./globals.css";
import QuillChatWidget from "./components/QuillChatWidget";

export const metadata: Metadata = {
  title: "The Writer's Room — The Tiniest Library",
  description: "A home for writers. Publish your stories, earn through Ink, and build your readership on The Tiniest Library.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <QuillChatWidget />
      </body>
    </html>
  );
}
