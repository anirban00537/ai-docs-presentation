import { TimelineContentSchema, type TimelineContent } from "@/types/presentation";
import {
  normalizeToMarkdown,
  isLegacyProseMirrorFormat,
} from "@/lib/markdown/prosemirror-converter";

export const createTimelineContent = (): TimelineContent => ({
  type: "timeline",
  title: '## Our Process {.center}',
  steps: [
    {
      title: "Step 1: Planning",
      description: "Define objectives and requirements for your project.",
    },
    {
      title: "Step 2: Execution",
      description: "Implement and develop according to the plan.",
    },
    {
      title: "Step 3: Delivery",
      description: "Launch and provide ongoing support and optimization.",
    },
  ],
});

export const normalizeTimelineContent = (content: any): TimelineContent => {
  if (!content || typeof content !== "object") return createTimelineContent();

  const title = isLegacyProseMirrorFormat(content.title)
    ? normalizeToMarkdown(content.title)
    : typeof content.title === "string"
      ? content.title
      : undefined;

  const steps = Array.isArray(content.steps)
    ? content.steps.map((step: any) => ({
      title: isLegacyProseMirrorFormat(step.title)
        ? normalizeToMarkdown(step.title)
        : typeof step.title === "string"
          ? step.title
          : "Step Title",
      description: isLegacyProseMirrorFormat(step.description)
        ? normalizeToMarkdown(step.description)
        : typeof step.description === "string"
          ? step.description
          : "Step Description",
    }))
    : [];

  const result = TimelineContentSchema.safeParse({
    ...content,
    title,
    steps,
  });

  if (result.success) {
    return result.data;
  }

  return createTimelineContent();
};
