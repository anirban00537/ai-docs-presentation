"use client";

import React from "react";
import { SolidColorPicker } from "./solid-color-picker";

interface SolidColorTabProps {
  color: string;
  onChange: (color: string) => void;
}

export function SolidColorTab({ color, onChange }: SolidColorTabProps) {
  return (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-3 block">
          Color
        </label>
        <div className="grid grid-cols-6 gap-2 overflow-visible">
          <SolidColorPicker color={color} onChange={onChange} />
        </div>
      </div>
    </div>
  );
}

