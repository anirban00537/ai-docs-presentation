import { nanoid } from "nanoid";
import type { Row } from "@/types/presentation";
import { BLOCK_TYPES, createQuoteContent } from "../blocks/definitions";
import type { Block } from "@/types/presentation";

export const ProblemQuoteLayout = {
  id: "problem-quote-layout",
  name: "Problem + User Quote",
  description: "Problem statement supported by a user quote",
  icon: "IconMessageChat",
  getRows: (): Row[] => {
    const statement: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content:
        '<h2 style="text-align: center">The Voice of the Customer</h2>\n\n<p style="text-align: center">Our stakeholders are frustrated. They need a solution that works as fast as they do.</p>',
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
