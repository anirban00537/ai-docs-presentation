"use client";

import React from "react";
import {
  ArrowUp,
  ArrowUpRight,
  ArrowRight,
  ArrowDownRight,
  ArrowDown,
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const directionConfig: Record<string, { icon: React.ReactNode; label: string }> = {
  "to top": { icon: <ArrowUp size={16} />, label: "Top" },
  "to top right": { icon: <ArrowUpRight size={16} />, label: "Top Right" },
  "to right": { icon: <ArrowRight size={16} />, label: "Right" },
  "to bottom right": { icon: <ArrowDownRight size={16} />, label: "Bottom Right" },
  "to bottom": { icon: <ArrowDown size={16} />, label: "Bottom" },
  "to bottom left": { icon: <ArrowDownLeft size={16} />, label: "Bottom Left" },
  "to left": { icon: <ArrowLeft size={16} />, label: "Left" },
  "to top left": { icon: <ArrowUpLeft size={16} />, label: "Top Left" },
};

const gridLayout = [
  ["to top left", "to top", "to top right"],
  ["to left", null, "to right"],
  ["to bottom left", "to bottom", "to bottom right"],
];

interface GradientDirectionPickerProps {
  gradientColors: string[];
  activeDirection: string | undefined;
  onDirectionChange: (direction: string) => void;
}

export function GradientDirectionPicker({
  gradientColors,
  activeDirection,
  onDirectionChange,
}: GradientDirectionPickerProps) {
  return (
    <div className="space-y-3">
      <label className="text-xs font-medium text-muted-foreground block">
        Direction
      </label>
      <div className="p-2 bg-muted/20 rounded-xl border border-border/50 w-fit mx-auto">
        <div className="grid grid-cols-3 gap-2">
          <TooltipProvider delayDuration={300}>
            {gridLayout.flat().map((dirName, index) => {
              if (!dirName) {
                return <div key={`empty-${index}`} className="w-9 h-9" />;
              }
              
              const config = directionConfig[dirName];
              const isActive = activeDirection === dirName;

              return (
                <Tooltip key={dirName}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onDirectionChange(dirName)}
                      className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50",
                        isActive
                          ? "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-md scale-105"
                          : "hover:bg-muted hover:shadow-sm border border-transparent hover:border-border/50"
                      )}
                      style={{
                        background: isActive 
                          ? `linear-gradient(${dirName}, ${gradientColors.join(", ")})` 
                          : undefined,
                      }}
                    >
                      <div className={cn(
                        "transition-colors duration-200",
                        isActive ? "text-white drop-shadow-md" : "text-muted-foreground"
                      )}>
                        {config.icon}
                      </div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    {config.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
