import { nanoid } from "nanoid";
import type { Row, LayoutTemplate } from "@/types/presentation";
import { BLOCK_TYPES, createImageContent } from "../blocks/definitions";
import { createSectionHeader, createProseMirrorBlock } from "./template-utils";

export const ContentWithImageLayout: LayoutTemplate = {
  id: "content-with-image-layout",
  name: "Title, Text & Image",
  description: "Classic content slide with heading, body text, and supporting image.",
  icon: "IconPhoto",
  accent: {
    url: "https://images.unsplash.com/photo-1618005891919-d3d4b5a92ead?q=80&w=1974&auto=format&fit=crop",
    position: "right",
    size: 35,
  },
  getRows: (): Row[] => {
    const titleBlock = createProseMirrorBlock(
      createSectionHeader(
        "Content Title",
        "Supporting subtitle or context for the slide content.",
        2
      )
    );

    const bodyTextBlock = createProseMirrorBlock(
      "Add your main content here. This is a flexible text area where you can write paragraphs, add formatting, and structure your message.\n\nYou can include multiple paragraphs to organize your thoughts clearly."
    );

    const imageBlock = {
      id: nanoid(),
      type: BLOCK_TYPES.IMAGE,
      content: createImageContent(),
    };

    return [
      {
        id: nanoid(),
        blocks: [titleBlock],
      },
      {
        id: nanoid(),
        blocks: [bodyTextBlock],
      },
      {
        id: nanoid(),
        blocks: [imageBlock],
      },
    ];
  },
};
