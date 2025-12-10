import type { ProseMirrorDocument } from "./common";

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

const hasValidDoc = (doc?: ProseMirrorDocument) =>
  doc?.type === "doc" && Array.isArray(doc.content);

export const normalizeTimelineContent = (content: any): TimelineContent => {
  const incoming = content as TimelineContent | undefined;
  if (incoming && Array.isArray(incoming.steps)) {
    return {
      type: "timeline",
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
};

