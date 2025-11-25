import React from "react";
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";

export const ALIGN_OPTIONS: Array<{
  value: "left" | "center" | "right";
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
}> = [
  { value: "left", icon: AlignLeft, label: "Align left" },
  { value: "center", icon: AlignCenter, label: "Align center" },
  { value: "right", icon: AlignRight, label: "Align right" },
];

export const GOOGLE_FONTS = [
  {
    value: "var(--font-poppins)",
    label: "Poppins",
    style: "var(--font-poppins)",
  },
  { value: "var(--font-inter)", label: "Inter", style: "var(--font-inter)" },
  { value: "var(--font-roboto)", label: "Roboto", style: "var(--font-roboto)" },
  {
    value: "var(--font-open-sans)",
    label: "Open Sans",
    style: "var(--font-open-sans)",
  },
  {
    value: "var(--font-montserrat)",
    label: "Montserrat",
    style: "var(--font-montserrat)",
  },
  { value: "var(--font-lato)", label: "Lato", style: "var(--font-lato)" },
  {
    value: "var(--font-playfair)",
    label: "Playfair Display",
    style: "var(--font-playfair)",
  },
  {
    value: "var(--font-merriweather)",
    label: "Merriweather",
    style: "var(--font-merriweather)",
  },
  {
    value: "var(--font-raleway)",
    label: "Raleway",
    style: "var(--font-raleway)",
  },
  { value: "var(--font-ubuntu)", label: "Ubuntu", style: "var(--font-ubuntu)" },
  {
    value: "var(--font-great-vibes)",
    label: "Great Vibes",
    style: "var(--font-great-vibes)",
  },
  {
    value: "var(--font-dancing-script)",
    label: "Dancing Script",
    style: "var(--font-dancing-script)",
  },
  {
    value: "var(--font-caveat)",
    label: "Caveat",
    style: "var(--font-caveat)",
  },
  {
    value: "var(--font-abril-fatface)",
    label: "Abril Fatface",
    style: "var(--font-abril-fatface)",
  },
  { value: "var(--font-lora)", label: "Lora", style: "var(--font-lora)" },
];

export const FONT_SIZE_OPTIONS = [
  { label: "Small", value: 12 },
  { label: "Body", value: 16 },
  { label: "Medium", value: 24 },
  { label: "Large", value: 36 },
  { label: "Extra Large", value: 48 },
  { label: "Huge", value: 64 },
  { label: "Massive", value: 80 },
  { label: "Giant", value: 96 },
  { label: "Enormous", value: 120 },
  { label: "Colossal", value: 144 },
  { label: "Titanic", value: 180 },
  { label: "Monumental", value: 240 },
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
