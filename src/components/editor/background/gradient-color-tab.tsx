"use client";

import React from "react";
import { Plus } from "lucide-react";
import { GradientColorPicker } from "./gradient-color-picker";
import { GradientDirectionPicker } from "./gradient-direction-picker";

interface GradientColorTabProps {
  gradientColors: string[];
  gradientDirection: string | undefined;
  onColorChange: (index: number, color: string) => void;
  onAddColor: () => void;
  onRemoveColor: (index: number) => void;
  onDirectionChange: (direction: string) => void;
}

export function GradientColorTab({
  gradientColors,
  gradientDirection,
  onColorChange,
  onAddColor,
  onRemoveColor,
  onDirectionChange,
}: GradientColorTabProps) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-6 gap-3 overflow-visible">
        <button
          className="relative w-10 h-10 rounded-full cursor-pointer border border-dashed border-border bg-muted/30 flex items-center justify-center hover:border-primary/50 hover:bg-primary/5 transition-all group"
          onClick={onAddColor}
          title="Add color stop"
        >
          <Plus size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
        </button>
        {gradientColors.map((color, index) => (
          <GradientColorPicker
            key={index}
            color={color}
            onChange={(newColor) => onColorChange(index, newColor)}
            onRemove={() => onRemoveColor(index)}
            showRemove={gradientColors.length > 2}
          />
        ))}
      </div>

      <GradientDirectionPicker
        gradientColors={gradientColors}
        activeDirection={gradientDirection}
        onDirectionChange={onDirectionChange}
      />
    </div>
  );
}

