import { TestimonialContentSchema, type TestimonialContent } from "@/types/presentation";

import { 
  normalizeToMarkdown, 
  isLegacyProseMirrorFormat, 
} from "@/lib/markdown/prosemirror-converter";

export const createTestimonialContent = (): TestimonialContent => ({
  type: "testimonial",
  quote: "This is a great testimonial from our customer.",
  name: "Jane Doe",
  role: "Product Manager",
  avatar: "",
});

export const normalizeTestimonialContent = (
  content: any
): TestimonialContent => {
  if (!content || typeof content !== "object") return createTestimonialContent();

  const quote = isLegacyProseMirrorFormat(content.quote)
    ? normalizeToMarkdown(content.quote)
    : typeof content.quote === "string"
    ? content.quote
    : createTestimonialContent().quote;
  
  const name = isLegacyProseMirrorFormat(content.name)
    ? normalizeToMarkdown(content.name)
    : typeof content.name === "string"
    ? content.name
    : createTestimonialContent().name;
  
  const role = isLegacyProseMirrorFormat(content.role)
    ? normalizeToMarkdown(content.role)
    : typeof content.role === "string"
    ? content.role
    : createTestimonialContent().role;
  
  const result = TestimonialContentSchema.safeParse({
    ...content,
    quote,
    name,
    role,
  });

  if (result.success) {
    return result.data;
  }

  return createTestimonialContent();
};
