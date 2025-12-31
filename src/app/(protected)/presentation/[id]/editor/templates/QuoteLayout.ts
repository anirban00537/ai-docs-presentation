import { nanoid } from "nanoid";
import type { Row, LayoutTemplate } from "@/types/presentation";
import { BLOCK_TYPES } from "../blocks/definitions";
import { createSectionHeader, createProseMirrorBlock } from "./template-utils";

export const QuoteLayout: LayoutTemplate = {
  id: "quote-layout",
  name: "Title, Quote & Text",
  description: "Inspirational slide featuring a prominent quote with supporting context.",
  icon: "IconQuote",
  accent: {
    url: "https://images.unsplash.com/photo-1618556450991-2f1af64e8191?q=80&w=1964&auto=format&fit=crop",
    position: "left",
    size: 30,
  },
  getRows: (): Row[] => {
    const titleBlock = createProseMirrorBlock(
      createSectionHeader(
        "Words of Wisdom",
        "Insights that drive our thinking forward.",
        2
      )
    );

    const quoteBlock = createProseMirrorBlock(
      '> "The best way to predict the future is to invent it."\n>\n> — Alan Kay'
    );

    const contextBlock = createProseMirrorBlock(
      "This quote reminds us that innovation requires action, vision, and courage. Add your own interpretation or context here."
    );

    return [
      {
        id: nanoid(),
        blocks: [titleBlock],
      },
      {
        id: nanoid(),
        blocks: [quoteBlock],
      },
      {
        id: nanoid(),
        blocks: [contextBlock],
      },
    ];
  },
};
