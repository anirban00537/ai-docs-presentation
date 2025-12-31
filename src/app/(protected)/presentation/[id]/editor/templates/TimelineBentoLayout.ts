import { nanoid } from "nanoid";
import type { Row, LayoutTemplate } from "@/types/presentation";
import { BLOCK_TYPES, createTimelineBentoContent } from "../blocks/definitions";
import { createSectionHeader, createProseMirrorBlock } from "./template-utils";

export const TimelineBentoLayout: LayoutTemplate = {
  id: "timeline-bento-layout",
  name: "Title, Description & Timeline Bento",
  description: "A rich, alternating timeline layout for detailed storytelling.",
  icon: "IconLayout",
  accent: {
    url: "https://images.unsplash.com/photo-1618556658017-c3b0c1d87a69?q=80&w=1964&auto=format&fit=crop",
    position: "top",
    size: 20,
  },
  getRows: (): Row[] => {
    const titleBlock = createProseMirrorBlock(
      createSectionHeader(
        "Journey Map",
        "Tracing the evolution of our product from concept to launch.",
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
            type: BLOCK_TYPES.TIMELINE_BENTO_BLOCK,
            content: createTimelineBentoContent(),
          },
        ],
      },
    ];
  },
};
