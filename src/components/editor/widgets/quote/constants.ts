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

