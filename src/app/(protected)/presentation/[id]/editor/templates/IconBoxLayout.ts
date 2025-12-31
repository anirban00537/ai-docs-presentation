import { nanoid } from "nanoid";
import type { Row, LayoutTemplate } from "@/types/presentation";
import { BLOCK_TYPES, createSolidIconBoxContent } from "../blocks/definitions";
import { createSectionHeader, createProseMirrorBlock } from "./template-utils";

export const IconBoxLayout: LayoutTemplate = {
  id: "icon-box-layout",
  name: "Title, Description & 3 Icon Boxes",
  description: "Display core features or services in a clean grid with illustrative icons.",
  icon: "IconComponents",
  accent: {
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop",
    position: "right",
    size: 35,
  },
  getRows: (): Row[] => {
    const titleBlock = createProseMirrorBlock(
      createSectionHeader(
        "Core Features",
        "Explore the powerful capabilities that drive our solution forward.",
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
            type: BLOCK_TYPES.SOLID_ICON_BOX_BLOCK,
            content: createSolidIconBoxContent(),
          },
        ],
      },
    ];
  },
};
