import { nanoid } from "@reduxjs/toolkit";
import { 
  Block, 
  BlockType, 
  CircleStatsContent, 
  CircleStatsItem,
  getDefaultHeadingContent 
} from "@/types/presentation";

export const createCircleStatsItem = (value: number = 75): CircleStatsItem => ({
  id: nanoid(),
  value,
  suffix: "",
  title: "#### Statistic",
  description: "Add a short description regarding this statistic.",
});

export const createCircleStatsContent = (): CircleStatsContent => ({
  type: "circle-stats-block",
  items: [
    createCircleStatsItem(88),
    createCircleStatsItem(11),
    createCircleStatsItem(55),
  ],
});

export const normalizeCircleStatsContent = (content: unknown): CircleStatsContent => {
  const defaultContent = createCircleStatsContent();
  if (!content || typeof content !== "object") return defaultContent;
  
  const c = content as Partial<CircleStatsContent>;
  if (c.type !== "circle-stats-block") return defaultContent;

  const items = Array.isArray(c.items) 
    ? c.items.map((item: any) => ({
        id: item.id || nanoid(),
        value: typeof item.value === 'number' ? item.value : 50,
        suffix: item.suffix || "",
        title: item.title || getDefaultHeadingContent(),
        description: item.description || getDefaultHeadingContent(),
      }))
    : defaultContent.items;

  return {
    type: "circle-stats-block",
    items,
  };
};

export const createCircleStatsBlock = (): Block => {
  return {
    id: nanoid(),
    type: "circle-stats-block" as BlockType,
    content: createCircleStatsContent(),
  };
};
