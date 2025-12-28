import { nanoid } from "nanoid";
import type { Row } from "@/types/presentation";
import { BLOCK_TYPES, createProgressBarContent } from "../blocks/definitions";
import type { Block } from "@/types/presentation";

export const ProgressLayout = {
  id: "progress-layout",
  name: "Progress Indicators",
  description: "Project status dashboard with animated progress bars for migrations, refactors, and training. Color-coded completion tracking.",
  icon: "IconTrendingUp",
  getRows: (): Row[] => {
    // Row 1: Section Title
    const headerBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content:
        '## Q3 Migration Status {.center}\n\nCurrent tracking against our core infrastructure goals. {.center}',
    };

    // Row 2: Progress Bars
    const progress = createProgressBarContent();
    progress.items = [
      {
        label: "Database Migration",
        value: 92,
        color: "#3b82f6",
      },
      {
        label: "Frontend Refactor",
        value: 68,
        color: "#10b981",
      },
      {
        label: "Legacy Decommission",
        value: 45,
        color: "#f59e0b",
      },
      {
        label: "Team Training",
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
