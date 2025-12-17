import type { ProseMirrorDocument } from "./common";
import { createParagraphContent } from "./common";

export interface TestimonialContent {
  type: "testimonial";
  quote: ProseMirrorDocument;
  name: ProseMirrorDocument;
  role: ProseMirrorDocument;
  avatar?: string;
}

import { normalizeToMarkdown, isLegacyProseMirrorFormat, isMarkdownFormat } from "@/lib/markdown/prosemirror-converter";

export const createTestimonialContent = (): TestimonialContent => ({
  type: "testimonial",
  quote: createParagraphContent(),
  name: "Jane Doe",
  role: "Product Manager",
  avatar: "",
});

export const normalizeTestimonialContent = (
  content: any
): TestimonialContent => {
  const incoming = content as TestimonialContent | undefined;
  if (incoming) {
    const quote = isMarkdownFormat(incoming.quote)
      ? incoming.quote
      : isLegacyProseMirrorFormat(incoming.quote)
      ? normalizeToMarkdown(incoming.quote)
      : createTestimonialContent().quote;
    
    const name = isMarkdownFormat(incoming.name)
      ? incoming.name
      : isLegacyProseMirrorFormat(incoming.name)
      ? normalizeToMarkdown(incoming.name)
      : createTestimonialContent().name;
    
    const role = isMarkdownFormat(incoming.role)
      ? incoming.role
      : isLegacyProseMirrorFormat(incoming.role)
      ? normalizeToMarkdown(incoming.role)
      : createTestimonialContent().role;
    
    return {
      type: "testimonial",
      quote,
      name,
      role,
      avatar: incoming.avatar ?? "",
    };
  }
  return createTestimonialContent();
};
