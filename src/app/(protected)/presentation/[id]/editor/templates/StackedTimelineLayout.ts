import { nanoid } from "nanoid";
import type { Row, LayoutTemplate } from "@/types/presentation";
import { BLOCK_TYPES, createStackedTimelineContent } from "../blocks/definitions";
import { createSectionHeader, createProseMirrorBlock } from "./template-utils";

export const StackedTimelineLayout: LayoutTemplate = {
  id: "stacked-timeline-layout",
  name: "Title, Description & Stacked Timeline",
  description: "A vertical roadmap layout perfect for showing history, future steps, or a chronological journey.",
  icon: "IconClock",
  accent: {
    url: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=1974&auto=format&fit=crop",
    position: "left",
    size: 30,
  },
  getRows: (): Row[] => {
    const titleBlock = createProseMirrorBlock(
      createSectionHeader(
        "Project Roadmap",
        "Key milestones and deliverables for the upcoming phases of development.",
        2
      )
    );

    return [
      {
        id: nanoid(),
        blocks: [titleBlock],
      },
      {
        id: nanoid(),
        blocks: [
          {
            id: nanoid(),
            type: BLOCK_TYPES.STACKED_TIMELINE_BLOCK,
            content: createStackedTimelineContent(),
          },
        ],
      },
    ];
  },
};
