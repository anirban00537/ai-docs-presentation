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

export interface CtaContent {
  type: "cta";
  heading: ProseMirrorDocument;
  body: ProseMirrorDocument;
  buttonLabel: string;
}

export interface QuoteContent {
  type: "quote";
  quote: ProseMirrorDocument;
  author: ProseMirrorDocument;
  style?: "centered" | "left-aligned";
}

export interface DividerContent {
  type: "divider";
  style?: "solid" | "dashed" | "dotted" | "double";
  spacing?: "small" | "medium" | "large";
}

export interface TimelineStep {
  title: ProseMirrorDocument;
  description: ProseMirrorDocument;
  icon?: string;
}

export interface TimelineContent {
  type: "timeline";
  title?: ProseMirrorDocument;
  steps: TimelineStep[];
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

export const createCtaContent = (): CtaContent => ({
  type: "cta",
  heading: {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Call to action" }],
      },
    ],
  },
  body: {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: "Describe the benefit here." }],
      },
    ],
  },
  buttonLabel: "Get started",
});

export const createQuoteContent = (): QuoteContent => ({
  type: "quote",
  quote: {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "This is an inspiring quote that captures the essence of your message.",
          },
        ],
      },
    ],
  },
  author: {
    type: "doc",
    content: [
      { type: "paragraph", content: [{ type: "text", text: "Author Name" }] },
    ],
  },
  style: "centered",
});

export const createDividerContent = (): DividerContent => ({
  type: "divider",
  style: "solid",
  spacing: "medium",
});

export const createTimelineContent = (): TimelineContent => ({
  type: "timeline",
  title: {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Our Process" }],
      },
    ],
  },
  steps: [
    {
      title: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Step 1: Planning" }],
          },
        ],
      },
      description: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Define objectives and requirements for your project.",
              },
            ],
          },
        ],
      },
      icon: "📋",
    },
    {
      title: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Step 2: Execution" }],
          },
        ],
      },
      description: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Implement and develop according to the plan.",
              },
            ],
          },
        ],
      },
      icon: "⚡",
    },
    {
      title: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Step 3: Delivery" }],
          },
        ],
      },
      description: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Launch and provide ongoing support and optimization.",
              },
            ],
          },
        ],
      },
      icon: "🚀",
    },
  ],
});

export const createBlockContentForType = (
  type: BlockType | undefined
):
  | ProseMirrorDocument
  | NumberCardContent
  | TestimonialContent
  | CtaContent
  | QuoteContent
  | DividerContent
  | TimelineContent => {
  switch (type) {
    case BLOCK_TYPES.NUMBER_CARD:
      return createNumberCardContent();
    case BLOCK_TYPES.TESTIMONIAL:
      return createTestimonialContent();
    case BLOCK_TYPES.CTA:
      return createCtaContent();
    case BLOCK_TYPES.QUOTE:
      return createQuoteContent();
    case BLOCK_TYPES.DIVIDER:
      return createDividerContent();
    case BLOCK_TYPES.TIMELINE:
      return createTimelineContent();
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
  | TestimonialContent
  | CtaContent
  | QuoteContent
  | DividerContent
  | TimelineContent => {
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
    if (incoming && hasValidDoc(incoming.quote)) {
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

  if (type === BLOCK_TYPES.CTA) {
    const incoming = content as CtaContent | undefined;
    const hasValidDoc = (doc?: ProseMirrorDocument) =>
      doc?.type === "doc" && Array.isArray(doc.content);
    if (
      incoming &&
      hasValidDoc(incoming.heading) &&
      hasValidDoc(incoming.body)
    ) {
      return {
        type: BLOCK_TYPES.CTA,
        heading: incoming.heading,
        body: incoming.body,
        buttonLabel: incoming.buttonLabel ?? "Get started",
      };
    }
    return createCtaContent();
  }

  if (type === BLOCK_TYPES.QUOTE) {
    const incoming = content as QuoteContent | undefined;
    const hasValidDoc = (doc?: ProseMirrorDocument) =>
      doc?.type === "doc" && Array.isArray(doc.content);
    if (incoming && hasValidDoc(incoming.quote)) {
      return {
        type: BLOCK_TYPES.QUOTE,
        quote: incoming.quote,
        author: hasValidDoc(incoming.author)
          ? incoming.author
          : createQuoteContent().author,
        style: incoming.style ?? "centered",
      };
    }
    return createQuoteContent();
  }

  if (type === BLOCK_TYPES.DIVIDER) {
    const incoming = content as DividerContent | undefined;
    if (incoming) {
      return {
        type: BLOCK_TYPES.DIVIDER,
        style: incoming.style ?? "solid",
        spacing: incoming.spacing ?? "medium",
      };
    }
    return createDividerContent();
  }

  if (type === BLOCK_TYPES.TIMELINE) {
    const incoming = content as TimelineContent | undefined;
    const hasValidDoc = (doc?: ProseMirrorDocument) =>
      doc?.type === "doc" && Array.isArray(doc.content);
    if (incoming && Array.isArray(incoming.steps)) {
      return {
        type: BLOCK_TYPES.TIMELINE,
        title:
          incoming.title && hasValidDoc(incoming.title)
            ? incoming.title
            : undefined,
        steps: incoming.steps.map((step) => ({
          title: hasValidDoc(step.title)
            ? step.title
            : createTimelineContent().steps[0].title,
          description: hasValidDoc(step.description)
            ? step.description
            : createTimelineContent().steps[0].description,
          icon: step.icon ?? "",
        })),
      };
    }
    return createTimelineContent();
  }

  // Default to prose content
  const incomingDoc = content as ProseMirrorDocument | undefined;
  if (incomingDoc?.type === "doc" && Array.isArray(incomingDoc.content)) {
    return incomingDoc;
  }
  return createDefaultHeadingContent();
};
