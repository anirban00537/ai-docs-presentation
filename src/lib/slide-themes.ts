export type SlideTheme = {
  id: string;
  name: string;
  description?: string;
  background: string;
  text: string;
  accent: string;
};

export const SLIDE_THEMES: SlideTheme[] = [
  {
    id: "modern-light",
    name: "Modern Light",
    description: "Soft neutral background with a bold primary accent.",
    background: "#f9fafb",
    text: "#020617",
    accent: "#2563eb",
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Dark canvas with high-contrast cyan accents.",
    background: "#020617",
    text: "#e5e7eb",
    accent: "#06b6d4",
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Warm gradient-inspired palette for storytelling decks.",
    background: "#fff7ed",
    text: "#111827",
    accent: "#f97316",
  },
  {
    id: "forest",
    name: "Forest",
    description: "Deep greens with a calm neutral background.",
    background: "#0f172a",
    text: "#e2f3e9",
    accent: "#22c55e",
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Cool blues inspired by coastal dashboards.",
    background: "#0b1120",
    text: "#e0f2fe",
    accent: "#38bdf8",
  },
  {
    id: "lavender",
    name: "Lavender",
    description: "Soft purples for friendly product updates.",
    background: "#f5f3ff",
    text: "#1e1b4b",
    accent: "#8b5cf6",
  },
  {
    id: "amber",
    name: "Amber",
    description: "Warm amber highlights on a subtle canvas.",
    background: "#fffbeb",
    text: "#1f2937",
    accent: "#f59e0b",
  },
  {
    id: "rose",
    name: "Rose",
    description: "Playful rose accents for marketing decks.",
    background: "#fff1f2",
    text: "#111827",
    accent: "#fb7185",
  },
  {
    id: "slate",
    name: "Slate",
    description: "Neutral slate grays for serious reports.",
    background: "#0f172a",
    text: "#e5e7eb",
    accent: "#64748b",
  },
  {
    id: "terminal",
    name: "Terminal",
    description: "Dark terminal style with neon green accents.",
    background: "#020617",
    text: "#e5e7eb",
    accent: "#22c55e",
  },
  {
    id: "mint",
    name: "Mint",
    description: "Fresh mint tones for calm analytics.",
    background: "#ecfdf5",
    text: "#064e3b",
    accent: "#10b981",
  },
  {
    id: "graphite",
    name: "Graphite",
    description: "Monochrome gray system for minimal decks.",
    background: "#111827",
    text: "#f9fafb",
    accent: "#9ca3af",
  },
  {
    id: "cream",
    name: "Cream",
    description: "Soft cream canvas with subtle brown accents.",
    background: "#faf5ff",
    text: "#292524",
    accent: "#a16207",
  },
  {
    id: "skyline",
    name: "Skyline",
    description: "Bright blues for product overviews.",
    background: "#eff6ff",
    text: "#020617",
    accent: "#3b82f6",
  },
  {
    id: "coral",
    name: "Coral",
    description: "Bold coral accent for standout callouts.",
    background: "#fff7ed",
    text: "#1f2937",
    accent: "#f97373",
  },
];


