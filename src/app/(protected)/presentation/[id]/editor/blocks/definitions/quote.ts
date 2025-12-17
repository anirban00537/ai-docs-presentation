import type { ProseMirrorDocument } from "./common";

export interface QuoteContent {
  type: "quote";
  quote: ProseMirrorDocument;
  author: ProseMirrorDocument;
  style?: "centered" | "left-aligned";
}

import { normalizeToMarkdown, isLegacyProseMirrorFormat, isMarkdownFormat } from "@/lib/markdown/prosemirror-converter";

export const createQuoteContent = (): QuoteContent => ({
  type: "quote",
  quote: "This is an inspiring quote that captures the essence of your message.",
  author: "Author Name",
  style: "centered",
});

export const normalizeQuoteContent = (content: any): QuoteContent => {
  const incoming = content as QuoteContent | undefined;
  if (incoming) {
    const quote = isMarkdownFormat(incoming.quote)
      ? incoming.quote
      : isLegacyProseMirrorFormat(incoming.quote)
      ? normalizeToMarkdown(incoming.quote)
      : createQuoteContent().quote;
    
    const author = isMarkdownFormat(incoming.author)
      ? incoming.author
      : isLegacyProseMirrorFormat(incoming.author)
      ? normalizeToMarkdown(incoming.author)
      : createQuoteContent().author;
    
    return {
      type: "quote",
      quote,
      author,
      style: incoming.style ?? "centered",
    };
  }
  return createQuoteContent();
};

