import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import {
  BLOCK_TYPES,
  createNumberCardContent,
} from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";
import { createParagraphContent } from "../blocks/definitions/common";

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
            content: [{ type: "text", text: "Why We Lead the Market" }],
          },
          {
            type: "paragraph",
            attrs: { textAlign: "center" },
            content: [
              {
                type: "text",
                text: "Built for speed, scale, and security from the ground up.",
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
          content: [{ type: "text", text: "Zero-Config Scale" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Handle millions of requests without manual provisioning. It just works.",
            },
          ],
        },
      ],
    };

    const feature2 = createNumberCardContent();
    feature2.number = 2;
    feature2.icon = "🌍";
    feature2.editorContent = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "Global Edge Network" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Deploy in 35 regions simultaneously. Lowest latency, guaranteed.",
            },
          ],
        },
      ],
    };

    const feature3 = createNumberCardContent();
    feature3.number = 3;
    feature3.icon = "👁️";
    feature3.editorContent = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "Deep Observability" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Trace every request with millisecond precision. No more black boxes.",
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

