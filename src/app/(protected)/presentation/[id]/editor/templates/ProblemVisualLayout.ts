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
  description: "Problem statement with impactful visual banner",
  icon: "😰",
  accent: {
    position: "top",
    size: 35,
    url: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1200",
  },
  getRows: (): Row[] => {
    // Problem statement - using markdown with center alignment via HTML
    const problemBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "# 73% of Teams Struggle with Remote Collaboration\n\nThe hidden cost of disconnected workflows is crippling productivity across industries.",
    };

    // Stats showing the problem
    const stats = createStatsCounterContent();
    stats.stats = [
      { value: 23, label: "Hours lost per week", icon: "⏱️", suffix: "" },
      { value: 10, label: "K lost per employee", icon: "💰", prefix: "$" },
      { value: 67, label: "Feel burned out", icon: "😓", suffix: "%" },
    ];
    stats.layout = "horizontal";
    stats.columns = 3;

    return [
      {
        id: nanoid(),
        blocks: [problemBlock],
      },
      {
        id: nanoid(),
        blocks: [createTypedBlock(BLOCK_TYPES.STATS_COUNTER, stats)],
      },
    ];
  },
};
