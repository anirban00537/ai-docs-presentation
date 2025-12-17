import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import { BLOCK_TYPES, createProgressBarContent } from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";
import { createParagraphContent } from "../blocks/definitions/common";

export const ProgressLayout = {
  id: "progress-layout",
  name: "Progress Indicators",
  description: "Show progress and achievements",
  icon: "📈",
  getRows: (): Row[] => {
    // Row 1: Section Title
    const headerBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "<h2 style=\"text-align: center\">Q3 Migration Status</h2>\n\n<p style=\"text-align: center\">Current tracking against our core infrastructure goals.</p>",
    };

    // Row 2: Progress Bars
    const progress = createProgressBarContent();
    progress.items = [
      {
        label: createParagraphContent("Database Migration"),
        value: 92,
        color: "#3b82f6",
      },
      {
        label: createParagraphContent("Frontend Refactor"),
        value: 68,
        color: "#10b981",
      },
      {
        label: createParagraphContent("Legacy Decommission"),
        value: 45,
        color: "#f59e0b",
      },
      {
        label: createParagraphContent("Team Training"),
        value: 15,
        color: "#8b5cf6",
      },
    ];
    progress.showPercentage = true;
    progress.animated = true;

    return [
      {
        id: nanoid(),
        blocks: [headerBlock],
      },
      {
        id: nanoid(),
        blocks: [
          {
            id: nanoid(),
            type: BLOCK_TYPES.PROGRESS_BAR,
            content: progress,
          },
        ],
      },
    ];
  },
};
