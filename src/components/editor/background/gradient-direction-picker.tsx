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

const gradientDirections = [
  { name: "to top", icon: <ArrowUp size={18} className="text-white" /> },
  {
    name: "to top right",
    icon: <ArrowUpRight size={18} className="text-white" />,
  },
  { name: "to right", icon: <ArrowRight size={18} className="text-white" /> },
  {
    name: "to bottom right",
    icon: <ArrowDownRight size={18} className="text-white" />,
  },
  { name: "to bottom", icon: <ArrowDown size={18} className="text-white" /> },
  {
    name: "to bottom left",
    icon: <ArrowDownLeft size={18} className="text-white" />,
  },
  { name: "to left", icon: <ArrowLeft size={18} className="text-white" /> },
  {
    name: "to top left",
    icon: <ArrowUpLeft size={18} className="text-white" />,
  },
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
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground block">
        Gradient Direction
      </label>
      <div className="flex gap-1.5">
        {gradientDirections.map((direction, index) => {
          const isActive = activeDirection === direction.name;
          return (
            <button
              key={index}
              onClick={() => onDirectionChange(direction.name)}
              className={cn(
                "rounded-lg overflow-hidden p-1.5 cursor-pointer flex items-center justify-center w-8 h-8 transition-all hover:scale-110",
                isActive &&
                  "ring-2 ring-primary ring-offset-1 ring-offset-background shadow-sm"
              )}
              style={{
                background: `linear-gradient(${direction.name}, ${gradientColors.join(", ")})`,
              }}
              title={direction.name}
            >
              <div className="scale-75">{direction.icon}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

