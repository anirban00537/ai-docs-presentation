import { nanoid } from "nanoid";
import type { Row, LayoutTemplate } from "@/types/presentation";
import { BLOCK_TYPES, createLeafBlockContent } from "../blocks/definitions";
import { createSectionHeader, createProseMirrorBlock } from "./template-utils";

export const LeafCardLayout: LayoutTemplate = {
  id: "leaf-card-layout",
  name: "Title, Description & 3 Leaf Cards",
  description: "Showcase core values or organic concepts with a soft, flowing design.",
  icon: "IconLeaf",
  accent: {
    url: "https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?q=80&w=1964&auto=format&fit=crop",
    position: "right",
    size: 32,
  },
  getRows: (): Row[] => {
    const titleBlock = createProseMirrorBlock(
      createSectionHeader(
        "Our Core Values",
        "The fundamental beliefs that guide our company culture and decisions.",
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
            type: BLOCK_TYPES.LEAF_BLOCK,
            content: createLeafBlockContent(),
          },
        ],
      },
    ];
  },
};
