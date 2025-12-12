import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import {
  BLOCK_TYPES,
  createQuoteContent,
  createNumberCardContent,
} from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";
import { createParagraphContent } from "../blocks/definitions/common";

export const SectionLayout = {
  id: "section-layout",
  name: "Section Break",
  description: "Organize your presentation with clear chapters",
  icon: "📑",
  getRows: (): Row[] => {
    // Row 1: Section Title
    const headerBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1, textAlign: "left" },
            content: [{ type: "text", text: "Chapter 02: Market Landscape" }],
          },
          {
            type: "paragraph",
            attrs: { textAlign: "left" },
            content: [
              {
                type: "text",
                text: "A detailed analysis of where we stand today and where the opportunity lies tomorrow.",
              },
            ],
          },
        ],
      },
    };

    // Row 2: Key Points (Number Cards)
    const point1 = createNumberCardContent();
    point1.number = 1;
    point1.icon = "🌍";
    point1.editorContent = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "TAM Analysis" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "$14B Total Addressable Market in US alone.",
            },
          ],
        },
      ],
    };

    const point2 = createNumberCardContent();
    point2.number = 2;
    point2.icon = "⚔️";
    point2.editorContent = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "Competitors" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Legacy players are slow; new entrants lack capital.",
            },
          ],
        },
      ],
    };

    const point3 = createNumberCardContent();
    point3.number = 3;
    point3.icon = "📈";
    point3.editorContent = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "Key Trends" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Remote work is accelerating demand for our solution.",
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
          { id: nanoid(), type: BLOCK_TYPES.NUMBER_CARD, content: point1 },
          { id: nanoid(), type: BLOCK_TYPES.NUMBER_CARD, content: point2 },
          { id: nanoid(), type: BLOCK_TYPES.NUMBER_CARD, content: point3 },
        ],
      },
    ];
  },
};
