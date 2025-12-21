import { nanoid } from "nanoid";
import type { Row } from "@/types/presentation";
import { BLOCK_TYPES, createQuoteContent } from "../blocks/definitions";
import type { Block } from "@/types/presentation";

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
      content: "<h2 style=\"text-align: center\">Guiding Principles</h2>",
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
