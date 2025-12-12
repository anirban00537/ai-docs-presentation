import type { ProseMirrorDocument } from "./common";
import { createParagraphContent } from "./common";

export interface TestimonialContent {
  type: "testimonial";
  quote: ProseMirrorDocument;
  name: ProseMirrorDocument;
  role: ProseMirrorDocument;
  avatar?: string;
}

export const createTestimonialContent = (): TestimonialContent => ({
  type: "testimonial",
  quote: createParagraphContent(),
  name: {
    type: "doc",
    content: [
      { type: "paragraph", content: [{ type: "text", text: "Jane Doe" }] },
    ],
  },
  role: {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: "Product Manager" }],
      },
    ],
  },
  avatar: "",
});

const hasValidDoc = (doc?: ProseMirrorDocument) =>
  doc?.type === "doc" && Array.isArray(doc.content);

export const normalizeTestimonialContent = (
  content: any
): TestimonialContent => {
  const incoming = content as TestimonialContent | undefined;
  if (incoming && hasValidDoc(incoming.quote)) {
    return {
      type: "testimonial",
      quote: incoming.quote,
      name: hasValidDoc(incoming.name)
        ? incoming.name
        : createTestimonialContent().name,
      role: hasValidDoc(incoming.role)
        ? incoming.role
        : createTestimonialContent().role,
      avatar: incoming.avatar ?? "",
    };
  }
  return createTestimonialContent();
};
