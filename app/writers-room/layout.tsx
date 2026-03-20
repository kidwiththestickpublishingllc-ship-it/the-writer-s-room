import type { Metadata } from "next";
import "./globals.css";
import QuillChatWidget from "./components/QuillChatWidget";
import WritersTour from "./components/WritersTour";

export const metadata: Metadata = {
  title: "The Writer's Room — The Tiniest Library",
  description: "A home for writers...",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <QuillChatWidget />
        <WritersTour />
      </body>
    </html>
  );
}