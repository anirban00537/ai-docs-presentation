import { nanoid } from "nanoid";
import type { Row } from "@/types/presentation";
import {
  BLOCK_TYPES,
  createStatsCounterContent,
} from "../block/blocks/definitions";
import type { Block } from "@/types/presentation";

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
      content:
        '<h2 style="text-align: center">By The Numbers</h2>\n\n<p style="text-align: center">Scale, speed, and reliability you can trust.</p>',
    };

    // Row 2: Stats Counter
    const stats = createStatsCounterContent();
    stats.stats = [
      {
        value: 50000,
        label: "Requests / Sec",
        icon: "⚡",
        suffix: "+",
      },
      {
        value: 35,
        label: "Global Regions",
        icon: "🌍",
        suffix: "",
      },
      {
        value: 99,
        label: "Uptime Guarantee",
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
