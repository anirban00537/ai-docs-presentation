"use client";

import React from "react";
import { SolidColorPicker } from "./solid-color-picker";

interface SolidColorTabProps {
  color: string;
  onChange: (color: string) => void;
}

export function SolidColorTab({ color, onChange }: SolidColorTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-6 gap-3 overflow-visible">
        <SolidColorPicker color={color} onChange={onChange} />
      </div>
    </div>
  );
}

