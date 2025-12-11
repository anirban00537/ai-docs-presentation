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
  description: "Highlight key features with premium cards",
  icon: "✨",
  getRows: (): Row[] => {
    // Row 1: Section Title & Subtitle
    const headerBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2, textAlign: "center" },
            content: [{ type: "text", text: "Why Choose Us" }],
          },
          {
            type: "paragraph",
            attrs: { textAlign: "center" },
            content: [
              {
                type: "text",
                text: "We provide the best tools to help you succeed in your mission.",
              },
            ],
          },
        ],
      },
    };

    // Row 2: Three Premium Feature Cards
    const feature1 = createNumberCardContent();
    feature1.number = 1;
    feature1.icon = "⚡";
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
              text: "Optimized for speed and efficiency.",
            },
          ],
        },
      ],
    };

    const feature2 = createNumberCardContent();
    feature2.number = 2;
    feature2.icon = "🛡️";
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
              text: "Enterprise-grade protection for your data.",
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
          content: [{ type: "text", text: "Beautiful UI" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Crafted with attention to every detail.",
            },
          ],
        },
      ],
    };

    return [
      {
        id: nanoid(),
        blocks: [headerBlock],
      },
      {
        id: nanoid(),
        blocks: [
          { id: nanoid(), type: BLOCK_TYPES.NUMBER_CARD, content: feature1 },
          { id: nanoid(), type: BLOCK_TYPES.NUMBER_CARD, content: feature2 },
          { id: nanoid(), type: BLOCK_TYPES.NUMBER_CARD, content: feature3 },
        ],
      },
    ];
  },
};

