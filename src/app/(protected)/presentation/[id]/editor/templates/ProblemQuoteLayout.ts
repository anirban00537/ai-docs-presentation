import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import { BLOCK_TYPES, createQuoteContent } from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";
import { createParagraphContent } from "../blocks/definitions/common";

export const ProblemQuoteLayout = {
  id: "problem-quote-layout",
  name: "Problem + User Quote",
  description: "Problem statement supported by a user quote",
  icon: "💬",
  getRows: (): Row[] => {
    const statement: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "The Voice of the Customer" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Our stakeholders are frustrated. They need a solution that works as fast as they do.",
              },
            ],
          },
        ],
      },
    };

    const quote = createQuoteContent();
    quote.quote = createParagraphContent("“It takes us 3 weeks to close the monthly books. In today's market, that delay is simply unsustainable. We are flying blind.”");
    quote.author = createParagraphContent("CFO, Global Retailer");

    return [
      {
        id: nanoid(),
        blocks: [statement],
      },
      {
        id: nanoid(),
        blocks: [{ id: nanoid(), type: BLOCK_TYPES.QUOTE, content: quote }],
      },
    ];
  },
};
