import { nanoid } from "nanoid";
import type { Row, LayoutTemplate } from "@/types/presentation";
import { BLOCK_TYPES, createCalloutContent, createButtonBlockContent } from "../blocks/definitions";
import { createSectionHeader, createProseMirrorBlock } from "./template-utils";

export const CalloutWithButtonLayout: LayoutTemplate = {
  id: "callout-with-button-layout",
  name: "Title, Callout & Button",
  description: "Action-oriented slide with a highlighted callout box and CTA button.",
  icon: "IconAlertCircle",
  accent: {
    url: "https://images.unsplash.com/photo-1618004652321-13a63e576b80?q=80&w=1974&auto=format&fit=crop",
    position: "bottom",
    size: 25,
  },
  getRows: (): Row[] => {
    const titleBlock = createProseMirrorBlock(
      createSectionHeader(
        "Important Announcement",
        "Key information you need to know.",
        2
      )
    );

    const calloutBlock = {
      id: nanoid(),
      type: BLOCK_TYPES.CALLOUT_BLOCK,
      content: createCalloutContent(),
    };

    const buttonBlock = {
      id: nanoid(),
      type: BLOCK_TYPES.BUTTON_BLOCK,
      content: createButtonBlockContent(),
    };

    return [
      {
        id: nanoid(),
        blocks: [titleBlock],
      },
      {
        id: nanoid(),
        blocks: [calloutBlock],
      },
      {
        id: nanoid(),
        blocks: [buttonBlock],
      },
    ];
  },
};
