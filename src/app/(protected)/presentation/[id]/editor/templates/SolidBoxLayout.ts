import { nanoid } from "nanoid";
import type { Row, LayoutTemplate } from "@/types/presentation";
import { BLOCK_TYPES, createSolidBoxContent } from "../blocks/definitions";
import { createSectionHeader, createProseMirrorBlock } from "./template-utils";

export const SolidBoxLayout: LayoutTemplate = {
  id: "solid-box-layout",
  name: "Title, Description & 3 Solid Boxes",
  description: "Emphasize major focus points or gallery items with bold, solid cards.",
  icon: "IconAppWindow",
  accent: {
    url: "https://images.unsplash.com/photo-1618005891825-37449c57c799?q=80&w=1932&auto=format&fit=crop",
    position: "background",
    size: 15,
  },
  getRows: (): Row[] => {
    const titleBlock = createProseMirrorBlock(
      createSectionHeader(
        "Focus Areas",
        "Deep diving into the three pillars of our strategic initiative.",
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
            type: BLOCK_TYPES.SOLID_BOX_BLOCK,
            content: createSolidBoxContent(),
          },
        ],
      },
    ];
  },
};
