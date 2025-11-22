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
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
          Solid Colors
        </h3>
        <div className="grid grid-cols-7 gap-2 px-1">
          {PRESET_COLORS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onBackgroundColorChange(preset)}
              className="group relative flex aspect-square items-center justify-center rounded-full border border-black/5 dark:border-white/5 shadow-sm hover:scale-110 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <span
                className="h-full w-full rounded-full border border-black/5 dark:border-white/10"
                style={{ backgroundColor: preset }}
              />
              {color === preset && (
                <span className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-offset-2 ring-primary ring-offset-background shadow-lg" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
          Custom
        </h3>
        <div className="px-1">
          <div className="flex items-center gap-3 p-3 rounded-xl border border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/20">
            <div className="flex-1 min-w-0">
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
    </div>
  );
}
