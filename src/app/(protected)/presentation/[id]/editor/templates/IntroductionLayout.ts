import { nanoid } from "nanoid";
import { Row, Block } from "@/lib/editor/types";
import type { LayoutTemplate } from "../layoutTemplates";
import {
  BLOCK_TYPES,
  createParagraphContent,
  createSpacerContent,
} from "../blocks/definitions";

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
          content: {
            type: "doc",
            content: [
              {
                type: "heading",
                attrs: { level: 1, textAlign: "center" },
                content: [
                  {
                    type: "text",
                    text: "User Research Findings for Product Development",
                  },
                ],
              },
              {
                type: "paragraph",
                attrs: { textAlign: "center" },
                content: [
                  {
                    type: "text",
                    text: "Key insights, pain points, and actionable recommendations from our recent research study",
                  },
                ],
              },
            ],
          },
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
