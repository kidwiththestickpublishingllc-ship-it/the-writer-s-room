"use client";
import WritersTour from "@/app/components/WritersTour";

export default function WritersRoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <WritersTour />
    </>
  );
}