import { ProgressBarContentSchema, type ProgressBarContent } from "@/types/presentation";

import { 
  normalizeToMarkdown, 
  isLegacyProseMirrorFormat, 
} from "@/lib/markdown/prosemirror-converter";

export const createProgressBarContent = (): ProgressBarContent => ({
  type: "progress-bar",
  items: [
    {
      label: "Design",
      value: 85,
      color: "#3b82f6",
    },
    {
      label: "Development",
      value: 60,
      color: "#10b981",
    },
  ],
  showPercentage: true,
  animated: true,
});

export const normalizeProgressBarContent = (
  content: any
): ProgressBarContent => {
  if (!content || typeof content !== "object") return createProgressBarContent();

  const items = Array.isArray(content.items)
    ? content.items.map((item: any) => ({
        ...item,
        label: isLegacyProseMirrorFormat(item.label)
          ? normalizeToMarkdown(item.label)
          : typeof item.label === "string"
          ? item.label
          : "Label",
        value: typeof item.value === "number" ? Math.min(100, Math.max(0, item.value)) : 0,
      }))
    : [];

  const result = ProgressBarContentSchema.safeParse({
    ...content,
    items,
  });

  if (result.success) {
    return result.data;
  }

  return createProgressBarContent();
};
