import type { QuoteStyle } from "./types";

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
