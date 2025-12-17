import { nanoid } from "nanoid";
import { Row, Block } from "@/lib/editor/types";
import type { LayoutTemplate } from "../layoutTemplates";
import { BLOCK_TYPES, createSpacerContent } from "../blocks/definitions";

export const IntroductionLayout: LayoutTemplate = {
  id: "introduction",
  name: "Introduction",
  description: "Big title with small subtitle",
  icon: "Heading",
  getRows: (): Row[] => [
    {
      id: nanoid(),
      blocks: [
        {
          id: nanoid(),
          type: BLOCK_TYPES.SPACER,
          content: createSpacerContent(120),
        } as Block,
      ],
    },
    {
      id: nanoid(),
      blocks: [
        {
          id: nanoid(),
          type: BLOCK_TYPES.PROSEMIRROR,
          content:
            '<h1 style="text-align: center">User Research Findings for Product Development</h1>\n\n<p style="text-align: center">Key insights, pain points, and actionable recommendations from our recent research study</p>',
        } as Block,
      ],
    },
    {
      id: nanoid(),
      blocks: [
        {
          id: nanoid(),
          type: BLOCK_TYPES.SPACER,
          content: createSpacerContent(120),
        } as Block,
      ],
    },
  ],
};
