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
  const gradientBackground = `linear-gradient(${gradientDirection || "to right"}, ${gradientColors.join(", ")})`;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Live Preview */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted-foreground">Preview</label>
        </div>
        <div 
          className="w-full h-20 rounded-xl border border-border/50 shadow-sm transition-all duration-500 ease-in-out"
          style={{ background: gradientBackground }}
        />
      </div>

      {/* Color Stops */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted-foreground">Color Stops</label>
          <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {gradientColors.length} stops
          </span>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center p-1">
          {gradientColors.map((color, index) => (
            <GradientColorPicker
              key={index}
              color={color}
              onChange={(newColor) => onColorChange(index, newColor)}
              onRemove={() => onRemoveColor(index)}
              showRemove={gradientColors.length > 2}
            />
          ))}
          
          <button
            className="group relative w-10 h-10 rounded-full border border-dashed border-muted-foreground/30 hover:border-primary/70 hover:bg-primary/5 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={onAddColor}
            title="Add color stop"
          >
            <Plus size={16} className="text-muted-foreground/70 group-hover:text-primary transition-colors" />
          </button>
        </div>
      </div>

      <div className="h-px bg-border/40 w-full" />

      {/* Direction Picker */}
      <GradientDirectionPicker
        gradientColors={gradientColors}
        activeDirection={gradientDirection}
        onDirectionChange={onDirectionChange}
      />
    </div>
  );
}

