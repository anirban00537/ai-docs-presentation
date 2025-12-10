import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import {
  BLOCK_TYPES,
  createNumberCardContent,
} from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";

export const FeatureLayout = {
  id: "feature-layout",
  name: "Features Showcase",
  description: "Highlight key features with number cards and descriptions",
  icon: "✨",
  getRows: (): Row[] => {
    // Row 1: Section Title
    const titleBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "Why Choose Us" }],
          },
        ],
      },
    };

    // Row 2: Three Feature Cards
    const feature1 = createNumberCardContent();
    feature1.number = 1;
    feature1.icon = "🚀";
    feature1.editorContent = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "Lightning Fast" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Experience blazing fast performance with our optimized platform.",
            },
          ],
        },
      ],
    };

    const feature2 = createNumberCardContent();
    feature2.number = 2;
    feature2.icon = "🔒";
    feature2.editorContent = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "Secure by Design" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Enterprise-grade security to keep your data safe and protected.",
            },
          ],
        },
      ],
    };

    const feature3 = createNumberCardContent();
    feature3.number = 3;
    feature3.icon = "🎨";
    feature3.editorContent = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "Easy to Use" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Intuitive interface designed for teams of all skill levels.",
            },
          ],
        },
      ],
    };

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
            type: BLOCK_TYPES.NUMBER_CARD,
            content: feature1,
          },
          {
            id: nanoid(),
            type: BLOCK_TYPES.NUMBER_CARD,
            content: feature2,
          },
          {
            id: nanoid(),
            type: BLOCK_TYPES.NUMBER_CARD,
            content: feature3,
          },
        ],
      },
    ];
  },
};

