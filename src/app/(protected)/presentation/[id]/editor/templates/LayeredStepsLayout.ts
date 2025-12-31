import { nanoid } from "nanoid";
import type { Row, LayoutTemplate } from "@/types/presentation";
import { BLOCK_TYPES, createLayeredNumberContent } from "../blocks/definitions";
import { createSectionHeader, createProseMirrorBlock } from "./template-utils";

export const LayeredStepsLayout: LayoutTemplate = {
  id: "layered-steps-layout",
  name: "Title, Description & 3 Layered Steps",
  description: "Visualize a sequential process or funnel with depth-based numbering.",
  icon: "IconStack",
  accent: {
    url: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974&auto=format&fit=crop",
    position: "right",
    size: 40,
  },
  getRows: (): Row[] => {
    const titleBlock = createProseMirrorBlock(
      createSectionHeader(
        "Implementation Process",
        "A systematic approach to integrating our solution into your workflow.",
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
            type: BLOCK_TYPES.LAYERED_NUMBER_BLOCK,
            content: createLayeredNumberContent(),
          },
        ],
      },
    ];
  },
};
