export const BLOCK_TYPES = {
  PROSEMIRROR: "prosemirror",
  NUMBER_CARD: "number-card",
  TESTIMONIAL: "testimonial",
  CTA: "cta",
  QUOTE: "quote",
  DIVIDER: "divider",
  TIMELINE: "timeline",
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

export const createParagraphContent = (): ProseMirrorDocument => ({
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [],
    },
  ],
});

export const getDefaultHeadingContent = createDefaultHeadingContent;

