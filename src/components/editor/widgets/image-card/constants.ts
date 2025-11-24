import React from "react";
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";

export const TOOLBAR_SELECTOR = '[data-image-card-toolbar="true"]';

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
];

export const FONT_SIZE_OPTIONS = [
  { label: "Extra Small", value: 14 },
  { label: "Small", value: 18 },
  { label: "Medium", value: 24 },
  { label: "Large", value: 32 },
  { label: "Extra Large", value: 42 },
  { label: "Huge", value: 56 },
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

export const IMAGE_STYLE_OPTIONS = [
  {
    value: "hero" as const,
    label: "Hero Image",
    description: "Large image on top with content below",
  },
  {
    value: "background" as const,
    label: "Background Image",
    description: "Text overlays directly on the background",
  },
  {
    value: "backgroundGlass" as const,
    label: "Glass Background",
    description: "Background image with glassmorphism panel",
  },
];

const UNSPLASH_PARAMS = "?auto=format&fit=crop&w=1200&q=80";

export const IMAGE_SUGGESTIONS = [
  {
    label: "Workspace",
    url: `https://images.unsplash.com/photo-1498050108023-c5249f4df085${UNSPLASH_PARAMS}`,
  },
  {
    label: "Mountain",
    url: `https://images.unsplash.com/photo-1500530855697-b586d89ba3ee${UNSPLASH_PARAMS}`,
  },
  {
    label: "City",
    url: `https://images.unsplash.com/photo-1482192597420-4817fdd7e8b0${UNSPLASH_PARAMS}`,
  },
  {
    label: "Abstract",
    url: `https://images.unsplash.com/photo-1500534314209-a25ddb2bd429${UNSPLASH_PARAMS}`,
  },
];

export const DEFAULT_IMAGE_URL = IMAGE_SUGGESTIONS[0]?.url;
