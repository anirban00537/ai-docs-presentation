import type { FAQContent, ProseMirrorDocument } from "@/types/presentation";

import { 
  normalizeToMarkdown, 
  isLegacyProseMirrorFormat, 
  isMarkdownFormat 
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
  const incoming = content as FAQContent | undefined;
  if (incoming?.items && Array.isArray(incoming.items)) {
    return {
      type: "faq",
      items: incoming.items.map((item) => ({
        question: isMarkdownFormat(item.question)
          ? item.question
          : isLegacyProseMirrorFormat(item.question)
          ? normalizeToMarkdown(item.question)
          : "Question?",
        answer: isMarkdownFormat(item.answer)
          ? item.answer
          : isLegacyProseMirrorFormat(item.answer)
          ? normalizeToMarkdown(item.answer)
          : "Answer here...",
        expanded: item.expanded ?? false,
      })),
      style: incoming.style ?? "accordion",
    };
  }
  return createFAQContent();
};
