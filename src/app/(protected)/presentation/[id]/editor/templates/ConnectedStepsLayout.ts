import { nanoid } from "nanoid";
import type { Row, LayoutTemplate } from "@/types/presentation";
import { BLOCK_TYPES, createConnectedStepsContent } from "../blocks/definitions";
import { createSectionHeader, createProseMirrorBlock } from "./template-utils";

export const ConnectedStepsLayout: LayoutTemplate = {
  id: "connected-steps-layout",
  name: "Connected Steps Journey",
  description: "A continuous vertical timeline connecting steps with a solid line.",
  icon: "IconListNumbers",
  accent: {
    url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop",
    position: "right",
    size: 30,
  },
  getRows: (): Row[] => {
    const titleBlock = createProseMirrorBlock(
      createSectionHeader(
        "Process Flow",
        "A detailed breakdown of the sequential steps involved in this process.",
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
            type: BLOCK_TYPES.CONNECTED_STEPS_BLOCK,
            content: createConnectedStepsContent(),
          },
        ],
      },
    ];
  },
};
