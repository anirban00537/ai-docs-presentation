import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import { BLOCK_TYPES, createProgressBarContent } from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";

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
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2, textAlign: "center" },
            content: [{ type: "text", text: "Project Status" }],
          },
          {
            type: "paragraph",
            attrs: { textAlign: "center" },
            content: [
              {
                type: "text",
                text: "Track your progress and milestones",
              },
            ],
          },
        ],
      },
    };

    // Row 2: Progress Bars
    const progress = createProgressBarContent();
    progress.items = [
      {
        label: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Design" }],
            },
          ],
        },
        value: 85,
        color: "#3b82f6",
      },
      {
        label: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Development" }],
            },
          ],
        },
        value: 60,
        color: "#10b981",
      },
      {
        label: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Testing" }],
            },
          ],
        },
        value: 40,
        color: "#f59e0b",
      },
      {
        label: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Deployment" }],
            },
          ],
        },
        value: 20,
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
