import { nanoid } from "nanoid";
import type { Row } from "@/types/presentation";
import { BLOCK_TYPES, createQuoteContent } from "../blocks/definitions";
import type { Block } from "@/types/presentation";
import { createParagraphContent } from "@/types/presentation";

export const ProblemTwoQuotesLayout = {
  id: "problem-two-quotes-layout",
  name: "Problem + Two Quotes",
  description: "Problem statement reinforced by two user quotes",
  icon: "🗣️",
  getRows: (): Row[] => {
    const intro: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "<h2 style=\"text-align: center\">Frustration is Universal</h2>\n\n<p style=\"text-align: center\">From the front lines to the C-suite, the lack of visibility is causing paralysis.</p>",
    };

    const quote1 = createQuoteContent();
    quote1.quote = createParagraphContent("“I spend half my day copy-pasting data between three different tools just to get my job done.”");
    quote1.author = createParagraphContent("Senior Account Executive");

    const quote2 = createQuoteContent();
    quote2.quote = createParagraphContent("“I can't give the board a reliable forecast because the data is always 48 hours old.”");
    quote2.author = createParagraphContent("VP of Sales Operations");

    return [
      {
        id: nanoid(),
        blocks: [intro],
      },
      {
        id: nanoid(),
        blocks: [
          { id: nanoid(), type: BLOCK_TYPES.QUOTE, content: quote1 },
          { id: nanoid(), type: BLOCK_TYPES.QUOTE, content: quote2 },
        ],
        columnWidths: [1, 1],
      },
    ];
  },
};

export default ProblemTwoQuotesLayout;
