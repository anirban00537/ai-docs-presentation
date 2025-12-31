import { nanoid } from "nanoid";
import type { Row, LayoutTemplate } from "@/types/presentation";
import { BLOCK_TYPES, createSidelineCardContent } from "../blocks/definitions";
import { createSectionHeader, createProseMirrorBlock } from "./template-utils";

export const SidelineCardLayout: LayoutTemplate = {
  id: "sideline-card-layout",
  name: "Title, Description & 3 Sideline Cards",
  description: "Present a clean list of items, agenda topics, or key takeaways.",
  icon: "IconAdjustmentsHorizontal",
  accent: {
    url: "https://images.unsplash.com/photo-1618005198914-c3b6f1f11ac6?q=80&w=1974&auto=format&fit=crop",
    position: "left",
    size: 28,
  },
  getRows: (): Row[] => {
    const titleBlock = createProseMirrorBlock(
      createSectionHeader(
        "Meeting Agenda",
        "Key topics and discussion points for today's session.",
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
            type: BLOCK_TYPES.SIDELINE_CARD_BLOCK,
            content: createSidelineCardContent(),
          },
        ],
      },
    ];
  },
};
