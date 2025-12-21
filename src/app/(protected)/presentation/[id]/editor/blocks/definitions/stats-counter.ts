import type { StatsCounterContent, ProseMirrorDocument } from "@/types/presentation";

import { 
  normalizeToMarkdown, 
  isLegacyProseMirrorFormat, 
  isMarkdownFormat 
} from "@/lib/markdown/prosemirror-converter";

export const createStatsCounterContent = (): StatsCounterContent => ({
  type: "stats-counter",
  stats: [
    {
      value: 10000,
      label: "Active Users",
      icon: "👥",
      suffix: "+",
    },
    {
      value: 99,
      label: "Uptime",
      icon: "⚡",
      suffix: "%",
    },
  ],
  layout: "horizontal",
  columns: 2,
});

export const normalizeStatsCounterContent = (
  content: any
): StatsCounterContent => {
  const incoming = content as StatsCounterContent | undefined;
  if (incoming?.stats && Array.isArray(incoming.stats)) {
    return {
      type: "stats-counter",
      stats: incoming.stats.map((stat) => ({
        value: stat.value ?? 0,
        label: isMarkdownFormat(stat.label)
          ? stat.label
          : isLegacyProseMirrorFormat(stat.label)
          ? normalizeToMarkdown(stat.label)
          : "Label",
        icon: stat.icon ?? "",
        prefix: stat.prefix ?? "",
        suffix: stat.suffix ?? "",
        color: stat.color,
      })),
      layout: incoming.layout ?? "horizontal",
      columns: incoming.columns ?? 2,
    };
  }
  return createStatsCounterContent();
};
