import React from "react";
import { AlignCenter, AlignLeft, AlignRight, Quote } from "lucide-react";
import type { QuoteWidget, QuoteStyle } from "./types";

export const TOOLBAR_SELECTOR = '[data-quote-toolbar="true"]';

export const QUOTE_STYLES: Array<{
  value: QuoteStyle;
  label: string;
  description: string;
}> = [
  {
    value: "minimal",
    label: "Minimal",
    description: "Clean and simple",
  },
  {
    value: "bold",
    label: "Bold",
    description: "Large and impactful",
  },
  {
    value: "bordered",
    label: "Bordered",
    description: "With decorative border",
  },
];

export const ALIGN_OPTIONS: Array<{
  value: QuoteWidget["textAlign"];
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
}> = [
  { value: "left", icon: AlignLeft, label: "Align left" },
  { value: "center", icon: AlignCenter, label: "Align center" },
  { value: "right", icon: AlignRight, label: "Align right" },
];

export const QUOTE_ICONS = [
  "Quote",
  "MessageSquare",
  "MessageCircle",
  "Sparkles",
  "Star",
  "Heart",
  "Zap",
  "Award",
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

export const FONT_SIZES = [
  12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96,
];

