export const BLOCK_TYPES = {
  PROSEMIRROR: "prosemirror",
  NUMBER_CARD: "number-card",
  TESTIMONIAL: "testimonial",
} as const;

export type BlockType = (typeof BLOCK_TYPES)[keyof typeof BLOCK_TYPES];

export const MAX_BLOCKS_PER_ROW = 3;

export interface ProseMirrorDocument {
  type: "doc";
  content: any[];
}

export interface NumberCardContent {
  type: "number-card";
  icon?: string;
  number?: number;
  editorContent: ProseMirrorDocument;
}

export interface TestimonialContent {
  type: "testimonial";
  quote: ProseMirrorDocument;
  name: ProseMirrorDocument;
  role: ProseMirrorDocument;
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

const createParagraphContent = (): ProseMirrorDocument => ({
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [],
    },
  ],
});

export const getDefaultNumberCardEditorContent = (): ProseMirrorDocument => ({
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 3 },
      content: [{ type: "text", text: "Title" }],
    },
    {
      type: "paragraph",
      content: [{ type: "text", text: "Description" }],
    },
  ],
});

export const createNumberCardContent = (): NumberCardContent => ({
  type: "number-card",
  icon: "",
  number: 1,
  editorContent: getDefaultNumberCardEditorContent(),
});

export const createTestimonialContent = (): TestimonialContent => ({
  type: "testimonial",
  quote: createParagraphContent(),
  name: {
    type: "doc",
    content: [
      { type: "paragraph", content: [{ type: "text", text: "Jane Doe" }] },
    ],
  },
  role: {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: "Product Manager" }],
      },
    ],
  },
});

export const createBlockContentForType = (
  type: BlockType | undefined
):
  | ProseMirrorDocument
  | NumberCardContent
  | TestimonialContent => {
  switch (type) {
    case BLOCK_TYPES.NUMBER_CARD:
      return createNumberCardContent();
    case BLOCK_TYPES.TESTIMONIAL:
      return createTestimonialContent();
    case BLOCK_TYPES.PROSEMIRROR:
    default:
      return createDefaultHeadingContent();
  }
};

export const normalizeBlockContent = (
  type: BlockType | undefined,
  content: any
):
  | ProseMirrorDocument
  | NumberCardContent
  | TestimonialContent => {
  if (type === BLOCK_TYPES.NUMBER_CARD) {
    const incoming = content as NumberCardContent | undefined;
    if (incoming?.editorContent?.type === "doc") {
      return {
        type: BLOCK_TYPES.NUMBER_CARD,
        icon: incoming.icon ?? "",
        number: incoming.number ?? 1,
        editorContent: incoming.editorContent,
      };
    }
    return createNumberCardContent();
  }

  if (type === BLOCK_TYPES.TESTIMONIAL) {
    const incoming = content as TestimonialContent | undefined;
    const hasValidDoc = (doc?: ProseMirrorDocument) =>
      doc?.type === "doc" && Array.isArray(doc.content);
    if (hasValidDoc(incoming?.quote)) {
      return {
        type: BLOCK_TYPES.TESTIMONIAL,
        quote: incoming.quote,
        name: hasValidDoc(incoming.name)
          ? incoming.name
          : createTestimonialContent().name,
        role: hasValidDoc(incoming.role)
          ? incoming.role
          : createTestimonialContent().role,
      };
    }
    return createTestimonialContent();
  }

  // Default to prose content
  const incomingDoc = content as ProseMirrorDocument | undefined;
  if (incomingDoc?.type === "doc" && Array.isArray(incomingDoc.content)) {
    return incomingDoc;
  }
  return createDefaultHeadingContent();
};

