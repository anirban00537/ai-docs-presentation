import { nanoid } from "nanoid";
import type { Row, LayoutTemplate } from "@/types/presentation";
import { BLOCK_TYPES, createSimpleNumberCardContent } from "../blocks/definitions";
import { createSectionHeader, createProseMirrorBlock } from "./template-utils";

export const NumberCardLayout: LayoutTemplate = {
  id: "number-card-layout",
  name: "Title, Description & 3 Number Cards",
  description: "Highlight key performance indicators, growth metrics, or statistics.",
  icon: "IconChartBar",
  accent: {
    url: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?q=80&w=1974&auto=format&fit=crop",
    position: "bottom",
    size: 25,
  },
  getRows: (): Row[] => {
    const titleBlock = createProseMirrorBlock(
      createSectionHeader(
        "By The Numbers",
        "A quantitative look at our growth and market impact this quarter.",
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
            type: BLOCK_TYPES.SIMPLE_NUMBER_CARD,
            content: createSimpleNumberCardContent(),
          },
        ],
      },
    ];
  },
};
