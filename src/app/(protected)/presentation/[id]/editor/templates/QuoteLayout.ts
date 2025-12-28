import { nanoid } from "nanoid";
import type { Row } from "@/types/presentation";
import { BLOCK_TYPES, createQuoteContent } from "../blocks/definitions";
import type { Block } from "@/types/presentation";

export const QuoteLayout = {
  id: "quote-layout",
  name: "Inspirational Quotes",
  description: "Two inspirational quotes with elegant typography in centered and left-aligned styles. Perfect for guiding principles slides.",
  icon: "IconQuote",
  getRows: (): Row[] => {
    // Row 1: Section Title
    const headerBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: '## Guiding Principles {.center}',
    };

    // Row 2: Centered Quote
    const quote1 = createQuoteContent();
    quote1.quote = "“The best way to predict the future is to create it.”";
    quote1.author = "Peter Drucker";
    quote1.style = "centered";

    // Row 3: Pull Quote Style
    const quote2 = createQuoteContent();
    quote2.quote = "“Culture eats strategy for breakfast.”";
    quote2.author = "Peter Drucker";
    quote2.style = "left-aligned";

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
