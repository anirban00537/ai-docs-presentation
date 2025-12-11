import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import {
  BLOCK_TYPES,
  createQuoteContent,
  createDividerContent,
  createNumberCardContent,
} from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";

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
            content: [{ type: "text", text: "Chapter 01: The Vision" }],
          },
          {
            type: "paragraph",
            attrs: { textAlign: "left" },
            content: [
              {
                type: "text",
                text: "A comprehensive deep dive into our strategic goals and future outlook.",
              },
            ],
          },
        ],
      },
    };

    // Row 2: Divider
    const divider1 = createDividerContent();
    divider1.style = "solid";
    divider1.spacing = "medium";

    // Row 3: Key Points (Number Cards)
    const point1 = createNumberCardContent();
    point1.number = 1;
    point1.icon = "👁️";
    point1.editorContent = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "Clarity" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Defining a clear path forward.",
            },
          ],
        },
      ],
    };

    const point2 = createNumberCardContent();
    point2.number = 2;
    point2.icon = "📈";
    point2.editorContent = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "Growth" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Scaling our impact globally.",
            },
          ],
        },
      ],
    };

    const point3 = createNumberCardContent();
    point3.number = 3;
    point3.icon = "🤝";
    point3.editorContent = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "Community" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Building stronger connections.",
            },
          ],
        },
      ],
    };

    // Row 4: Divider
    const divider2 = createDividerContent();
    divider2.style = "dotted";
    divider2.spacing = "medium";

    return [
      {
        id: nanoid(),
        blocks: [headerBlock],
      },
      {
        id: nanoid(),
        blocks: [
          {
            id: nanoid(),
            type: BLOCK_TYPES.DIVIDER,
            content: divider1,
          },
        ],
      },
      {
        id: nanoid(),
        blocks: [
          { id: nanoid(), type: BLOCK_TYPES.NUMBER_CARD, content: point1 },
          { id: nanoid(), type: BLOCK_TYPES.NUMBER_CARD, content: point2 },
          { id: nanoid(), type: BLOCK_TYPES.NUMBER_CARD, content: point3 },
        ],
      },
      {
        id: nanoid(),
        blocks: [
          {
            id: nanoid(),
            type: BLOCK_TYPES.DIVIDER,
            content: divider2,
          },
        ],
      },
    ];
  },
};

