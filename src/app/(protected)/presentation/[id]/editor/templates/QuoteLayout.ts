import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import { BLOCK_TYPES, createQuoteContent } from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";

export const QuoteLayout = {
  id: "quote-layout",
  name: "Inspirational Quotes",
  description: "Share wisdom with elegant typography",
  icon: "💭",
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
            attrs: { level: 2, textAlign: "center" },
            content: [{ type: "text", text: "Words to Live By" }],
          },
        ],
      },
    };

    // Row 2: Centered Quote
    const quote1 = createQuoteContent();
    quote1.quote = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Design is not just what it looks like. Design is how it works.",
            },
          ],
        },
      ],
    };
    quote1.author = {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "Steve Jobs" }] },
      ],
    };
    quote1.style = "centered";

    // Row 3: Pull Quote Style
    const quote2 = createQuoteContent();
    quote2.quote = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Simplicity is the ultimate sophistication.",
            },
          ],
        },
      ],
    };
    quote2.author = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Leonardo da Vinci" }],
        },
      ],
    };
    quote2.style = "left-aligned"; // "default" usually implies the left-border/pull-quote style in many systems, assuming handled by block

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
            type: BLOCK_TYPES.QUOTE,
            content: quote1,
          },
        ],
      },
      {
        id: nanoid(),
        blocks: [
          {
            id: nanoid(),
            type: BLOCK_TYPES.QUOTE,
            content: quote2,
          },
        ],
      },
    ];
  },
};
