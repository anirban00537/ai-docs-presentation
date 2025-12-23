/**
 * Problem Visual Layout Template
 * Problem statement with impactful visual at the top.
 * 
 * @example
 * Used for: Problem slides, Pain point visualization, Opening hooks
 */

import { nanoid } from "nanoid";
import type { Row, LayoutTemplate, Block } from "@/types/presentation";
import { BLOCK_TYPES, createStatsCounterContent } from "../blocks/definitions";
import { createTypedBlock } from "./template-utils";

export const ProblemVisualLayout: LayoutTemplate = {
  id: "problem-visual-layout",
  name: "Problem Visual",
  description: "Impactful problem statement emphasizing the cost of inaction",
  icon: "IconAlertTriangle",
  accent: {
    position: "top",
    size: 40,
    url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1600", // Chaotic/Busy work environment
  },
  getRows: (): Row[] => {
    // Main Problem Hook
    const problemBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "# The Hidden Cost of Disconnected Teams\n\nIn today's remote-first world, information silos are killing productivity. Teams are working harder, but achieving less.",
    };

    // Supporting Stats - Quantifying the pain
    const stats = createStatsCounterContent();
    stats.stats = [
      { value: 12, label: "Hours lost/week", icon: "IconHourglass", suffix: "" },
      { value: 450, label: "Billion lost/yr", icon: "IconChartLine", prefix: "$" },
      { value: 85, label: "Employee Burnout", icon: "IconFlame", suffix: "%" },
    ];
    stats.layout = "horizontal";
    stats.columns = 3;

    // Concluding insight
    const insightBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "### The Reality\n\nWithout a unified operating system, knowledge workers spend **20% of their time** just looking for information. This is not sustainable.",
    };

    return [
      {
        id: nanoid(),
        blocks: [problemBlock],
      },
      {
        id: nanoid(),
        blocks: [createTypedBlock(BLOCK_TYPES.STATS_COUNTER, stats)],
      },
      {
        id: nanoid(),
        blocks: [insightBlock],
      },
    ];
  },
};
