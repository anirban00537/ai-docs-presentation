export const BLOCK_TYPES = {
  PROSEMIRROR: "prosemirror",
  NUMBER_CARD: "number-card",
  TESTIMONIAL: "testimonial",
  CTA: "cta",
  QUOTE: "quote",
  DIVIDER: "divider",
  TIMELINE: "timeline",
  TEAM_CARD: "team-card",
  PRICING_CARD: "pricing-card",
  IMAGE_GALLERY: "image-gallery",
  STATS_COUNTER: "stats-counter",
  FEATURE_LIST: "feature-list",
  COMPARISON_TABLE: "comparison-table",
  FAQ: "faq",
  LOGO_GRID: "logo-grid",
  VIDEO: "video",
  CODE: "code",
  PROGRESS_BAR: "progress-bar",
  SOCIAL_PROOF: "social-proof",
  BADGE: "badge",
} as const;

export type BlockType = (typeof BLOCK_TYPES)[keyof typeof BLOCK_TYPES];

export const MAX_BLOCKS_PER_ROW = 3;

export interface ProseMirrorDocument {
  type: "doc";
  content: any[];
}

const createDefaultHeadingContent = (): ProseMirrorDocument => ({
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: "" }],
    },
  ],
});

export const createParagraphContent = (
  text: string = ""
): ProseMirrorDocument => ({
  type: "doc",
  content: [
    { type: "paragraph", content: text ? [{ type: "text", text }] : [] },
  ],
});

export const withAlpha = (color: string, opacity: number): string => {
  // Simple hex to rgba conversion
  if (color.startsWith("#")) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color; // Fallback
};

export const getDefaultHeadingContent = createDefaultHeadingContent;
