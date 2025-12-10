import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import {
  BLOCK_TYPES,
  createQuoteContent,
  createDividerContent,
} from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";

export const QuoteLayout = {
  id: "quote-layout",
  name: "Inspirational Quotes",
  description: "Showcase inspiring quotes with elegant design",
  icon: "💭",
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
            content: [{ type: "text", text: "Words That Inspire" }],
          },
        ],
      },
    };

    // Row 2: First Quote
    const quote1 = createQuoteContent();
    quote1.quote = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle.",
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

    // Row 3: Divider
    const divider1 = createDividerContent();
    divider1.style = "dashed";
    divider1.spacing = "medium";

    // Row 4: Second Quote
    const quote2 = createQuoteContent();
    quote2.quote = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Innovation distinguishes between a leader and a follower. The ability to innovate is what separates success from failure.",
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
          content: [{ type: "text", text: "Anonymous" }],
        },
      ],
    };
    quote2.style = "centered";

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
            type: BLOCK_TYPES.DIVIDER,
            content: divider1,
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

