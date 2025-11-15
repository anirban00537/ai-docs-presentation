"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BackgroundTabsProps {
  backgroundType: "solid" | "gradient";
  onTypeChange: (type: "solid" | "gradient") => void;
}

export function BackgroundTabs({
  backgroundType,
  onTypeChange,
}: BackgroundTabsProps) {
  return (
    <div className="flex gap-6 border-b border-border/50">
      <button
        type="button"
        onClick={() => onTypeChange("solid")}
        className={cn(
          "relative pb-2 px-1 text-sm font-medium transition-colors",
          backgroundType === "solid"
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Solid
        {backgroundType === "solid" && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
        )}
      </button>
      <button
        type="button"
        onClick={() => onTypeChange("gradient")}
        className={cn(
          "relative pb-2 px-1 text-sm font-medium transition-colors",
          backgroundType === "gradient"
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Gradient
        {backgroundType === "gradient" && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
        )}
      </button>
    </div>
  );
}

