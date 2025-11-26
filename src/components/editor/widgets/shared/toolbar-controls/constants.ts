import React from "react";
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import { GOOGLE_FONT_OPTIONS } from "@/lib/fonts";

export const ALIGN_OPTIONS: Array<{
  value: "left" | "center" | "right";
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
}> = [
  { value: "left", icon: AlignLeft, label: "Align left" },
  { value: "center", icon: AlignCenter, label: "Align center" },
  { value: "right", icon: AlignRight, label: "Align right" },
];

export const GOOGLE_FONTS = GOOGLE_FONT_OPTIONS;

export const FONT_SIZE_OPTIONS = [
  { label: "Extra Small", value: 16 },
  { label: "Small", value: 28 },
  { label: "Medium", value: 44 },
  { label: "Large", value: 64 },
  { label: "Extra Large", value: 96 },
  { label: "Display", value: 132 },
  { label: "Huge", value: 180 },
];

export const BACKGROUND_TYPE_OPTIONS = [
  { label: "Solid", value: "solid" as const, description: "Flat color fill" },
  {
    label: "Glass",
    value: "glass" as const,
    description: "Frosted glass effect",
  },
  {
    label: "Transparent",
    value: "transparent" as const,
    description: "No fill, inherits slide background",
  },
];
