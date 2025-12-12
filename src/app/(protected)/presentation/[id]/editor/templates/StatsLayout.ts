import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import { BLOCK_TYPES, createStatsCounterContent } from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";

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
            content: [{ type: "text", text: "Our Impact" }],
          },
          {
            type: "paragraph",
            attrs: { textAlign: "center" },
            content: [
              {
                type: "text",
                text: "Numbers that speak for themselves",
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
        value: 10000,
        label: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Active Users" }],
            },
          ],
        },
        icon: "👥",
        suffix: "+",
      },
      {
        value: 99,
        label: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Uptime" }],
            },
          ],
        },
        icon: "⚡",
        suffix: "%",
      },
      {
        value: 50,
        label: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Countries" }],
            },
          ],
        },
        icon: "🌍",
        suffix: "+",
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
