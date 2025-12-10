// Block type constants
export const BLOCK_TYPES = {
  PROSEMIRROR: "prosemirror",
  NUMBER_CARD: "number-card",
} as const;

export type BlockType = typeof BLOCK_TYPES[keyof typeof BLOCK_TYPES];

// Default block configurations
export const DEFAULT_BLOCK_CONFIGS = {
  [BLOCK_TYPES.PROSEMIRROR]: {
    type: BLOCK_TYPES.PROSEMIRROR,
    content: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "" }],
        },
      ],
    },
  },
  [BLOCK_TYPES.NUMBER_CARD]: {
    type: BLOCK_TYPES.NUMBER_CARD,
    content: {
      type: "number-card",
      icon: "",
      number: 1,
      title: "Title",
      description: "Description",
    },
  },
} as const;

