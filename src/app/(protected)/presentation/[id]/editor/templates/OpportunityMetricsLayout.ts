import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import { BLOCK_TYPES, createStatsCounterContent } from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";
import { createParagraphContent } from "../blocks/definitions/common";

export const OpportunityMetricsLayout = {
  id: "opportunity-metrics-layout",
  name: "Opportunity Metrics",
  description: "Highlight the market or opportunity with three key metrics",
  icon: "📈",
  getRows: (): Row[] => {
    const header: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2, textAlign: "center" },
            content: [{ type: "text", text: "A Massive Untapped Opportunity" }],
          },
          {
            type: "paragraph",
            attrs: { textAlign: "center" },
            content: [
              {
                type: "text",
                text: "The market is shifting rapidly. We are positioned to capture a significant share of this emerging $100B+ ecosystem.",
              },
            ],
          },
        ],
      },
    };

    const stats = createStatsCounterContent();
    stats.stats = [
      {
        value: 125,
        label: createParagraphContent("Total Addressable Market"),
        suffix: "B",
        icon: "🌍",
      },
      {
        value: 42,
        label: createParagraphContent("Year-over-Year Growth"),
        suffix: "%",
        icon: "📈",
      },
      {
        value: 10,
        label: createParagraphContent("Active Early Adopters"),
        suffix: "k+",
        icon: "🚀",
      },
    ];
    stats.columns = 3;
    stats.layout = "horizontal";

    return [
      {
        id: nanoid(),
        blocks: [header],
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
