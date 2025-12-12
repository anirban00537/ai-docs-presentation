import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import { BLOCK_TYPES, createStatsCounterContent } from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";
import { createParagraphContent } from "../blocks/definitions/common";

export const StatsLayout = {
  id: "stats-layout",
  name: "Statistics Dashboard",
  description: "Showcase key metrics with animated counters",
  icon: "📊",
  getRows: (): Row[] => {
    // Row 1: Section Title
    const headerBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2, textAlign: "center" },
            content: [{ type: "text", text: "By The Numbers" }],
          },
          {
            type: "paragraph",
            attrs: { textAlign: "center" },
            content: [
              {
                type: "text",
                text: "Scale, speed, and reliability you can trust.",
              },
            ],
          },
        ],
      },
    };

    // Row 2: Stats Counter
    const stats = createStatsCounterContent();
    stats.stats = [
      {
        value: 50000,
        label: createParagraphContent("Requests / Sec"),
        icon: "⚡",
        suffix: "+",
      },
      {
        value: 35,
        label: createParagraphContent("Global Regions"),
        icon: "🌍",
        suffix: "",
      },
      {
        value: 99,
        label: createParagraphContent("Uptime Guarantee"),
        icon: "🛡️",
        suffix: ".99%",
      },
    ];
    stats.layout = "horizontal";
    stats.columns = 3;

    return [
      {
        id: nanoid(),
        blocks: [headerBlock],
      },
      {
        id: nanoid(),
        blocks: [
          { id: nanoid(), type: BLOCK_TYPES.STATS_COUNTER, content: stats },
        ],
      },
    ];
  },
};
