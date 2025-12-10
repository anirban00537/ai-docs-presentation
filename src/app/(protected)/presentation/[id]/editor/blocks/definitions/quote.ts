import type { ProseMirrorDocument } from "./common";

export interface QuoteContent {
  type: "quote";
  quote: ProseMirrorDocument;
  author: ProseMirrorDocument;
  style?: "centered" | "left-aligned";
}

export const createQuoteContent = (): QuoteContent => ({
  type: "quote",
  quote: {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "This is an inspiring quote that captures the essence of your message.",
          },
        ],
      },
    ],
  },
  author: {
    type: "doc",
    content: [
      { type: "paragraph", content: [{ type: "text", text: "Author Name" }] },
    ],
  },
  style: "centered",
});

const hasValidDoc = (doc?: ProseMirrorDocument) =>
  doc?.type === "doc" && Array.isArray(doc.content);

export const normalizeQuoteContent = (content: any): QuoteContent => {
  const incoming = content as QuoteContent | undefined;
  if (incoming && hasValidDoc(incoming.quote)) {
    return {
      type: "quote",
      quote: incoming.quote,
      author: hasValidDoc(incoming.author)
        ? incoming.author
        : createQuoteContent().author,
      style: incoming.style ?? "centered",
    };
  }
  return createQuoteContent();
};

