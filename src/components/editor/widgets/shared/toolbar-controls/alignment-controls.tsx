"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ALIGN_OPTIONS } from "./constants";
import type { AlignmentConfig } from "./types";

interface AlignmentControlsProps {
  config: AlignmentConfig;
}

export const AlignmentControls: React.FC<AlignmentControlsProps> = ({
  config,
}) => {
  return (
    <div className="flex items-center gap-1 bg-black/5 rounded-full p-1">
      {ALIGN_OPTIONS.map(({ value, icon: Icon, label }) => (
        <Button
          key={value}
          variant="ghost"
          size="icon-sm"
          className={cn(
            "w-7 h-7 rounded-full transition-all duration-200",
            config.value === value
              ? "bg-white text-foreground shadow-sm ring-1 ring-black/5"
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

