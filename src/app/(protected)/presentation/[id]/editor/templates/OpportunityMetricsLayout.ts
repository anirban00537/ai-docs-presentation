import { nanoid } from "nanoid";
import type { Row } from "@/types/presentation";
import { BLOCK_TYPES, createStatsCounterContent } from "../blocks/definitions";
import type { Block } from "@/types/presentation";

export const OpportunityMetricsLayout = {
  id: "opportunity-metrics-layout",
  name: "Opportunity Metrics",
  description: "Highlight the market or opportunity with three key metrics",
  icon: "📈",
  getRows: (): Row[] => {
    const header: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "<h2 style=\"text-align: center\">A Massive Untapped Opportunity</h2>\n\n<p style=\"text-align: center\">The market is shifting rapidly. We are positioned to capture a significant share of this emerging $100B+ ecosystem.</p>",
    };

    const stats = createStatsCounterContent();
    stats.stats = [
      {
        value: 125,
        label: "Total Addressable Market",
        suffix: "B",
        icon: "🌍",
      },
      {
        value: 42,
        label: "Year-over-Year Growth",
        suffix: "%",
        icon: "📈",
      },
      {
        value: 10,
        label: "Active Early Adopters",
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
