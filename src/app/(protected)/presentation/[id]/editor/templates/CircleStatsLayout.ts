import { nanoid } from "nanoid";
import type { Row, LayoutTemplate } from "@/types/presentation";
import { BLOCK_TYPES, createCircleStatsContent } from "../blocks/definitions";
import { createSectionHeader, createProseMirrorBlock } from "./template-utils";

export const CircleStatsLayout: LayoutTemplate = {
  id: "circle-stats-layout",
  name: "Circular Statistics",
  description: "Display key metrics with animated circular progress bars.",
  icon: "IconChartDonut",
  accent: {
    url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
    position: "top",
    size: 25,
  },
  getRows: (): Row[] => {
    const titleBlock = createProseMirrorBlock(
      createSectionHeader(
        "Key Performance Indicators",
        "Our critical metrics for the current quarter, highlighting growth and engagement.",
        2
      )
    );

    return [
      {
        id: nanoid(),
        blocks: [titleBlock],
      },
      {
        id: nanoid(),
        blocks: [
          {
            id: nanoid(),
            type: BLOCK_TYPES.CIRCLE_STATS_BLOCK,
            content: createCircleStatsContent(),
          },
        ],
      },
    ];
  },
};
