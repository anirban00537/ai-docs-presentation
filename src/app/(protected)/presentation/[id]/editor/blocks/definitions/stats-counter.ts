import { StatsCounterContentSchema, type StatsCounterContent } from "@/types/presentation";

import { 
  normalizeToMarkdown, 
  isLegacyProseMirrorFormat, 
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
  if (!content || typeof content !== "object") return createStatsCounterContent();

  const stats = Array.isArray(content.stats)
    ? content.stats.map((stat: any) => ({
        ...stat,
        label: isLegacyProseMirrorFormat(stat.label)
          ? normalizeToMarkdown(stat.label)
          : typeof stat.label === "string"
          ? stat.label
          : "Label",
        value: typeof stat.value === "number" ? stat.value : 0,
      }))
    : [];

  const result = StatsCounterContentSchema.safeParse({
    ...content,
    stats,
  });

  if (result.success) {
    return result.data;
  }

  return createStatsCounterContent();
};
