"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import { selectGlobalTheme } from "@/store/slices/slidesSlice";

export const ToolbarSeparator: React.FC<{ className?: string }> = ({
  className,
}) => {
  const globalTheme = useAppSelector(selectGlobalTheme);
  const isDarkTheme = globalTheme?.tone === "dark";

  return (
    <div
      className={cn(
        "h-4 w-px rounded-full",
        isDarkTheme ? "bg-white/10" : "bg-black/10",
        className
      )}
    />
  );
};

