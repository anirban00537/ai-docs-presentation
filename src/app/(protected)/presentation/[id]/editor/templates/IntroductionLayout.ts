/**
 * Introduction Layout Template
 * Big title with small subtitle - perfect for opening slides.
 * 
 * @example
 * Used for: Opening slides, Section dividers, Title pages
 */

import { nanoid } from "nanoid";
import type { Row, Block, LayoutTemplate } from "@/types/presentation";
import { BLOCK_TYPES, createSpacerContent } from "../blocks/definitions";
import { createSectionHeader, createProseMirrorBlock } from "./template-utils";

export const IntroductionLayout: LayoutTemplate = {
  id: "introduction",
  name: "Introduction",
  description: "Big title with small subtitle",
  icon: "IconHandWave",
  getRows: (): Row[] => {
    const spacerContent = createSpacerContent(120);
    
    const titleBlock = createProseMirrorBlock(
      createSectionHeader(
        "User Research Findings for Product Development",
        "Key insights, pain points, and actionable recommendations from our recent research study",
        1
      )
    );

    return [
      {
        id: nanoid(),
        blocks: [
          {
            id: nanoid(),
            type: BLOCK_TYPES.SPACER,
            content: spacerContent,
          },
        ],
      },
      {
        id: nanoid(),
        blocks: [titleBlock],
      },
      {
        id: nanoid(),
        blocks: [
          {
            id: nanoid(),
            type: BLOCK_TYPES.SPACER,
            content: spacerContent,
          },
        ],
      },
    ];
  },
};
