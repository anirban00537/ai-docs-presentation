import type { ProseMirrorDocument } from "./common";
import { createParagraphContent } from "./common";

export interface FAQItem {
  question: ProseMirrorDocument;
  answer: ProseMirrorDocument;
  expanded?: boolean;
}

export interface FAQContent {
  type: "faq";
  items: FAQItem[];
  style: "accordion" | "tabs";
}

export const createFAQContent = (): FAQContent => ({
  type: "faq",
  items: [
    {
      question: createParagraphContent("How does it work?"),
      answer: createParagraphContent(
        "It's simple and straightforward. Just follow the steps outlined in our documentation."
      ),
      expanded: false,
    },
    {
      question: createParagraphContent("What are the pricing plans?"),
      answer: createParagraphContent(
        "We offer flexible pricing plans to suit your needs. Check our pricing page for details."
      ),
      expanded: false,
    },
  ],
  style: "accordion",
});

import { normalizeToMarkdown, isLegacyProseMirrorFormat, isMarkdownFormat } from "@/lib/markdown/prosemirror-converter";

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
          : createParagraphContent("Question?"),
        answer: isMarkdownFormat(item.answer)
          ? item.answer
          : isLegacyProseMirrorFormat(item.answer)
          ? normalizeToMarkdown(item.answer)
          : createParagraphContent("Answer here..."),
        expanded: item.expanded ?? false,
      })),
      style: incoming.style ?? "accordion",
    };
  }
  return createFAQContent();
};
