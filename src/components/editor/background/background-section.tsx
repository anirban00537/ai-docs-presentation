"use client";

import React from "react";
import { ColorPicker } from "./color-picker";

const PRESET_COLORS = [
  "#0f172a",
  "#1d4ed8",
  "#065f46",
  "#92400e",
  "#b91c1c",
  "#6d28d9",
  "#7c3aed",
  "#f97316",
  "#e11d48",
  "#22c55e",
  "#0ea5e9",
  "#6366f1",
  "#facc15",
  "#64748b",
  "#111827",
  // extra accents
  "#ecfeff",
  "#fef9c3",
  "#fee2e2",
  "#e0e7ff",
  "#f5f3ff",
];

const PRESET_GRADIENTS = [
  ["#667eea", "#764ba2"], // Purple to deep purple
  ["#f093fb", "#f5576c"], // Pink to coral
  ["#4facfe", "#00f2fe"], // Blue to cyan
  ["#43e97b", "#38f9d7"], // Green to turquoise
  ["#fa709a", "#fee140"], // Pink to yellow
  ["#30cfd0", "#330867"], // Cyan to deep purple
  ["#a8edea", "#fed6e3"], // Light cyan to light pink
  ["#ff9a9e", "#fecfef"], // Coral to light pink
  ["#ffecd2", "#fcb69f"], // Cream to peach
  ["#ff6e7f", "#bfe9ff"], // Coral to light blue
  ["#c471f5", "#fa71cd"], // Purple to pink
  ["#fbc2eb", "#a6c1ee"], // Light pink to light blue
  ["#a8caba", "#5d4e75"], // Mint to purple
  ["#ffecd2", "#fcb69f", "#ff8a80"], // Cream to peach to coral
  ["#667eea", "#764ba2", "#f093fb"], // Purple gradient
  ["#4facfe", "#00f2fe", "#43e97b"], // Blue to cyan to green
  ["#fa709a", "#fee140", "#30cfd0"], // Pink to yellow to cyan
  ["#ff9a9e", "#fecfef", "#ffecd2"], // Coral to pink to cream
  ["#a8edea", "#fed6e3", "#ffecd2"], // Cyan to pink to cream
  ["#c471f5", "#fa71cd", "#ff9a9e"], // Purple to pink to coral
];

interface BackgroundSectionProps {
  backgroundColor: string[] | string | undefined;
  onBackgroundColorChange: (colors: string[]) => void;
}

export function BackgroundSection({
  backgroundColor,
  onBackgroundColorChange,
}: BackgroundSectionProps) {
  // Normalize backgroundColor to array (handle backward compatibility with string values)
  const colors = Array.isArray(backgroundColor)
    ? backgroundColor.length > 0
      ? backgroundColor
      : ["#ffffff"]
    : backgroundColor
    ? [backgroundColor]
    : ["#ffffff"];

  const generateRandomColor = () => {
    // Generate a random hex color
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const handleColorChange = (index: number, newColor: string) => {
    const newColors = [...colors];
    newColors[index] = newColor;
    onBackgroundColorChange(newColors);
  };

  const handleAddColor = () => {
    const randomColor = generateRandomColor();
    const newColors = [...colors, randomColor];
    onBackgroundColorChange(newColors);
  };

  const handleRemoveColor = (index: number) => {
    if (colors.length <= 1) return;
    const newColors = colors.filter((_, i) => i !== index);
    onBackgroundColorChange(newColors);
  };

  return (
    <div className="space-y-7">
      <div className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest">
            Background Colors
          </h3>
          <button
            type="button"
            onClick={handleAddColor}
            className="text-xs font-semibold text-primary hover:text-primary/90 transition-all duration-200 px-2.5 py-1 rounded-lg hover:bg-primary/10 active:scale-95"
          >
            + Add Color
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2.5 px-1">
          {colors.map((color, index) => (
            <div key={index} className="relative group/picker">
              <ColorPicker
                color={color}
                onChange={(newColor) => handleColorChange(index, newColor)}
                onRemove={() => handleRemoveColor(index)}
                showRemove={colors.length > 1}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3.5">
        <h3 className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest px-1">
          Gradient Presets
        </h3>
        <div className="grid grid-cols-7 gap-2.5 px-1">
          {PRESET_GRADIENTS.map((gradient, index) => {
            const gradientString = `linear-gradient(to right, ${gradient.join(", ")})`;
            const isActive =
              colors.length === gradient.length &&
              colors.every((c, i) => c === gradient[i]);
            return (
              <button
                key={index}
                type="button"
                onClick={() => onBackgroundColorChange([...gradient])}
                className="group relative flex aspect-square items-center justify-center rounded-xl border border-border/50 shadow-sm hover:scale-110 hover:shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 overflow-hidden active:scale-105"
              >
                <span
                  className="h-full w-full rounded-xl border border-border/40"
                  style={{ background: gradientString }}
                />
                {isActive && (
                  <span className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3.5">
        <h3 className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest px-1">
          Solid Colors
        </h3>
        <div className="grid grid-cols-7 gap-2.5 px-1">
          {PRESET_COLORS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onBackgroundColorChange([preset])}
              className="group relative flex aspect-square items-center justify-center rounded-xl border border-border/50 shadow-sm hover:scale-110 hover:shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 active:scale-105"
            >
              <span
                className="h-full w-full rounded-xl border border-border/40"
                style={{ backgroundColor: preset }}
              />
              {colors.length === 1 && colors[0] === preset && (
                <span className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
