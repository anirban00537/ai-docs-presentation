import type { TimelineContent, ProseMirrorDocument } from "@/types/presentation";
import { 
  normalizeToMarkdown, 
  isLegacyProseMirrorFormat, 
  isMarkdownFormat 
} from "@/lib/markdown/prosemirror-converter";

export const createTimelineContent = (): TimelineContent => ({
  type: "timeline",
  title: '<h2 style="text-align: center">Our Process</h2>',
  steps: [
    {
      title: "Step 1: Planning",
      description: "Define objectives and requirements for your project.",
      icon: "📋",
    },
    {
      title: "Step 2: Execution",
      description: "Implement and develop according to the plan.",
      icon: "⚡",
    },
    {
      title: "Step 3: Delivery",
      description: "Launch and provide ongoing support and optimization.",
      icon: "🚀",
    },
  ],
});

export const normalizeTimelineContent = (content: any): TimelineContent => {
  const incoming = content as TimelineContent | undefined;
  if (incoming && Array.isArray(incoming.steps)) {
    const title = incoming.title
      ? (isMarkdownFormat(incoming.title)
          ? incoming.title
          : isLegacyProseMirrorFormat(incoming.title)
          ? normalizeToMarkdown(incoming.title)
          : undefined)
      : undefined;
    
    const defaultStep = createTimelineContent().steps[0];
    
    return {
      type: "timeline",
      title,
      steps: incoming.steps.map((step) => ({
        title: isMarkdownFormat(step.title)
          ? step.title
          : isLegacyProseMirrorFormat(step.title)
          ? normalizeToMarkdown(step.title)
          : defaultStep.title,
        description: isMarkdownFormat(step.description)
          ? step.description
          : isLegacyProseMirrorFormat(step.description)
          ? normalizeToMarkdown(step.description)
          : defaultStep.description,
        icon: step.icon ?? "",
      })),
    };
  }
  return createTimelineContent();
};
