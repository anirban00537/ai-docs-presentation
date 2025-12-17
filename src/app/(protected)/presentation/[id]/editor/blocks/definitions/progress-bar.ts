import type { ProseMirrorDocument } from "./common";
import { createParagraphContent } from "./common";

export interface ProgressItem {
  label: ProseMirrorDocument;
  value: number;
  color?: string;
}

export interface ProgressBarContent {
  type: "progress-bar";
  items: ProgressItem[];
  showPercentage?: boolean;
  animated?: boolean;
}

export const createProgressBarContent = (): ProgressBarContent => ({
  type: "progress-bar",
  items: [
    {
      label: createParagraphContent("Design"),
      value: 85,
      color: "#3b82f6",
    },
    {
      label: createParagraphContent("Development"),
      value: 60,
      color: "#10b981",
    },
  ],
  showPercentage: true,
  animated: true,
});

import { normalizeToMarkdown, isLegacyProseMirrorFormat, isMarkdownFormat } from "@/lib/markdown/prosemirror-converter";

export const normalizeProgressBarContent = (
  content: any
): ProgressBarContent => {
  const incoming = content as ProgressBarContent | undefined;
  if (incoming?.items && Array.isArray(incoming.items)) {
    return {
      type: "progress-bar",
      items: incoming.items.map((item) => ({
        label: isMarkdownFormat(item.label)
          ? item.label
          : isLegacyProseMirrorFormat(item.label)
          ? normalizeToMarkdown(item.label)
          : createParagraphContent("Label"),
        value: Math.min(100, Math.max(0, item.value ?? 0)),
        color: item.color,
      })),
      showPercentage: incoming.showPercentage ?? true,
      animated: incoming.animated ?? true,
    };
  }
  return createProgressBarContent();
};
