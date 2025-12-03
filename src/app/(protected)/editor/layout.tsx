"use client";

import React from "react";
import { useAppSelector } from "@/store/hooks";
import { selectGlobalTheme } from "@/store/slices/slidesSlice";

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const globalTheme = useAppSelector(selectGlobalTheme);

  return (
    <div
      className="fixed inset-0 w-full h-full overflow-hidden"
      style={{
        backgroundColor: globalTheme?.surface || "var(--background)",
      }}
    >
      {children}
    </div>
  );
}

