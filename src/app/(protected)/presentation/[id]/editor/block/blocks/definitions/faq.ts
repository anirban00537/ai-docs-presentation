import { FAQContentSchema, type FAQContent } from "@/types/presentation";

import { 
  normalizeToMarkdown, 
  isLegacyProseMirrorFormat, 
} from "@/lib/markdown/prosemirror-converter";

export const createFAQContent = (): FAQContent => ({
  type: "faq",
  items: [
    {
      question: "How does it work?",
      answer: "It's simple and straightforward. Just follow the steps outlined in our documentation.",
      expanded: false,
    },
    {
      question: "What are the pricing plans?",
      answer: "We offer flexible pricing plans to suit your needs. Check our pricing page for details.",
      expanded: false,
    },
  ],
  style: "accordion",
});

export const normalizeFAQContent = (content: any): FAQContent => {
  if (!content || typeof content !== "object") return createFAQContent();

  const items = Array.isArray(content.items)
    ? content.items.map((item: any) => ({
        ...item,
        question: isLegacyProseMirrorFormat(item.question)
          ? normalizeToMarkdown(item.question)
          : typeof item.question === "string"
          ? item.question
          : "Question?",
        answer: isLegacyProseMirrorFormat(item.answer)
          ? normalizeToMarkdown(item.answer)
          : typeof item.answer === "string"
          ? item.answer
          : "Answer here...",
      }))
    : [];

  const result = FAQContentSchema.safeParse({
    ...content,
    items,
  });

  if (result.success) {
    return result.data;
  }

  return createFAQContent();
};
