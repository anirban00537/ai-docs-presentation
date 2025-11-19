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
    <div className="flex p-1 bg-muted/40 rounded-xl border border-border/40">
      <button
        type="button"
        onClick={() => onTypeChange("solid")}
        className={cn(
          "flex-1 py-1.5 text-xs font-medium rounded-lg transition-all duration-200",
          backgroundType === "solid"
            ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
        )}
      >
        Solid Color
      </button>
      <button
        type="button"
        onClick={() => onTypeChange("gradient")}
        className={cn(
          "flex-1 py-1.5 text-xs font-medium rounded-lg transition-all duration-200",
          backgroundType === "gradient"
            ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
        )}
      >
        Gradient
      </button>
    </div>
  );
}

