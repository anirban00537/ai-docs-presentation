import { nanoid } from "nanoid";
import type { Row } from "@/types/presentation";
import { BLOCK_TYPES, createQuoteContent } from "../blocks/definitions";
import type { Block } from "@/types/presentation";

export const ProblemQuoteLayout = {
  id: "problem-quote-layout",
  name: "Problem + User Quote",
  description: "Customer pain point with executive-level quote highlighting urgency. Powerful voice-of-customer validation for problem slides.",
  icon: "IconMessageChat",
  getRows: (): Row[] => {
    const statement: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content:
        '## The Voice of the Customer {.center}\n\nOur stakeholders are frustrated. They need a solution that works as fast as they do. {.center}',
    };

    const quote = createQuoteContent();
    quote.quote =
      "“It takes us 3 weeks to close the monthly books. In today's market, that delay is simply unsustainable. We are flying blind.”";
    quote.author = "CFO, Global Retailer";

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
