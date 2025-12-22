import { QuoteContentSchema, type QuoteContent } from "@/types/presentation";
import { 
  normalizeToMarkdown, 
  isLegacyProseMirrorFormat, 
} from "@/lib/markdown/prosemirror-converter";

export const createQuoteContent = (): QuoteContent => ({
  type: "quote",
  quote: "This is an inspiring quote that captures the essence of your message.",
  author: "Author Name",
  style: "centered",
});

export const normalizeQuoteContent = (content: any): QuoteContent => {
  if (!content || typeof content !== "object") return createQuoteContent();

  const quote = isLegacyProseMirrorFormat(content.quote)
    ? normalizeToMarkdown(content.quote)
    : typeof content.quote === "string"
    ? content.quote
    : createQuoteContent().quote;
  
  const author = isLegacyProseMirrorFormat(content.author)
    ? normalizeToMarkdown(content.author)
    : typeof content.author === "string"
    ? content.author
    : createQuoteContent().author;
  
  const result = QuoteContentSchema.safeParse({
    ...content,
    quote,
    author,
  });

  if (result.success) {
    return result.data;
  }

  return createQuoteContent();
};
