"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import { selectGlobalTheme } from "@/store/slices/slidesSlice";
import { ALIGN_OPTIONS } from "./constants";
import type { AlignmentConfig } from "./types";

interface AlignmentControlsProps {
  config: AlignmentConfig;
}

export const AlignmentControls: React.FC<AlignmentControlsProps> = ({
  config,
}) => {
  const globalTheme = useAppSelector(selectGlobalTheme);
  const isDarkTheme = globalTheme?.tone === "dark";

  return (
    <div
      className={cn(
        "flex items-center gap-0.5 rounded-md p-0.5",
        isDarkTheme ? "bg-white/5" : "bg-black/5"
      )}
    >
      {ALIGN_OPTIONS.map(({ value, icon: Icon, label }) => (
        <Button
          key={value}
          variant="ghost"
          size="icon-sm"
          className={cn(
            "w-6 h-6 rounded-md transition-all duration-200 ease-out",
            "hover:scale-[1.03] active:scale-[0.97]",
            config.value === value
              ? isDarkTheme
                ? "bg-white/10 text-white/90 shadow-sm ring-1 ring-white/10"
                : "bg-white text-foreground shadow-sm ring-1 ring-black/5"
              : isDarkTheme
              ? "text-white/70 hover:text-white/90 hover:bg-white/5"
              : "text-muted-foreground hover:text-foreground hover:bg-black/5"
          )}
          onClick={() => config.onChange(value)}
          aria-pressed={config.value === value}
          title={label}
        >
          <Icon className="h-3.5 w-3.5" />
        </Button>
      ))}
    </div>
  );
};

