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

interface BackgroundSectionProps {
  backgroundColor: string | undefined;
  onBackgroundColorChange: (color: string) => void;
}

export function BackgroundSection({
  backgroundColor,
  onBackgroundColorChange,
}: BackgroundSectionProps) {
  const color = backgroundColor ? backgroundColor : "#ffffff";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Background
        </label>
      </div>

      <div className="pt-2">
        {/* Preset palette */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">
              Presets
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onBackgroundColorChange(preset)}
                className="relative flex h-7 w-7 items-center justify-center rounded-full border border-border/60 shadow-sm hover:scale-105 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <span
                  className="h-5 w-5 rounded-full border border-white/70"
                  style={{ backgroundColor: preset }}
                />
                {color === preset && (
                  <span className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-offset-1 ring-primary/80 ring-offset-background" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Custom color */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">
              Custom Color
            </label>
          </div>
          <div className="flex flex-wrap gap-3 items-center p-1">
            <ColorPicker
              color={color}
              onChange={onBackgroundColorChange}
              onRemove={() => {}}
              showRemove={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
