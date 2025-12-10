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
  name: "Sectioned Content",
  description: "Organize content with dividers and mixed blocks",
  icon: "📑",
  getRows: (): Row[] => {
    // Row 1: Main Heading
    const headingBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "Section Title" }],
          },
        ],
      },
    };

    // Row 2: Subheading
    const subheadingBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "A comprehensive overview of key points and insights.",
              },
            ],
          },
        ],
      },
    };

    // Row 3: Divider
    const divider1 = createDividerContent();
    divider1.style = "double";
    divider1.spacing = "medium";

    // Row 4: Key Points (Number Cards)
    const point1 = createNumberCardContent();
    point1.number = 1;
    point1.icon = "✨";
    point1.editorContent = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "Key Insight" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Highlight important information with visual emphasis.",
            },
          ],
        },
      ],
    };

    const point2 = createNumberCardContent();
    point2.number = 2;
    point2.icon = "🎯";
    point2.editorContent = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "Main Focus" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Emphasize core concepts and strategic priorities.",
            },
          ],
        },
      ],
    };

    const point3 = createNumberCardContent();
    point3.number = 3;
    point3.icon = "💡";
    point3.editorContent = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "Key Takeaway" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Summarize essential points for easy comprehension.",
            },
          ],
        },
      ],
    };

    // Row 5: Divider
    const divider2 = createDividerContent();
    divider2.style = "dotted";
    divider2.spacing = "medium";

    // Row 6: Inspirational Quote
    const quote = createQuoteContent();
    quote.quote = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Great presentations are built on clear structure and meaningful content that resonates with the audience.",
            },
          ],
        },
      ],
    };
    quote.author = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Presentation Design Expert" }],
        },
      ],
    };
    quote.style = "centered";

    return [
      {
        id: nanoid(),
        blocks: [headingBlock],
      },
      {
        id: nanoid(),
        blocks: [subheadingBlock],
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
            type: BLOCK_TYPES.NUMBER_CARD,
            content: point1,
          },
          {
            id: nanoid(),
            type: BLOCK_TYPES.NUMBER_CARD,
            content: point2,
          },
          {
            id: nanoid(),
            type: BLOCK_TYPES.NUMBER_CARD,
            content: point3,
          },
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
      {
        id: nanoid(),
        blocks: [
          {
            id: nanoid(),
            type: BLOCK_TYPES.QUOTE,
            content: quote,
          },
        ],
      },
    ];
  },
};

