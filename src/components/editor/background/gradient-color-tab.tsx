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
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-3 block">
          Gradient Colors
        </label>
        <div className="grid grid-cols-6 gap-2 overflow-visible">
          <button
            className="relative w-10 h-10 rounded-full cursor-pointer border-2 border-border/60 bg-muted/30 flex items-center justify-center hover:border-primary/50 hover:bg-muted/50 transition-all"
            onClick={onAddColor}
          >
            <Plus size={18} className="text-muted-foreground" />
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
      </div>

      <GradientDirectionPicker
        gradientColors={gradientColors}
        activeDirection={gradientDirection}
        onDirectionChange={onDirectionChange}
      />
    </div>
  );
}

