import { CtaContentSchema, type CtaContent } from "@/types/presentation";
import { 
  normalizeToMarkdown, 
  isLegacyProseMirrorFormat, 
} from "@/lib/markdown/prosemirror-converter";

export const createCtaContent = (): CtaContent => ({
  type: "cta",
  heading: '<h2 style="text-align: center">Call to action</h2>',
  body: '<p style="text-align: center">Describe the benefit here.</p>',
  buttonLabel: "Get started",
});

export const normalizeCtaContent = (content: any): CtaContent => {
  if (!content || typeof content !== "object") return createCtaContent();

  const heading = isLegacyProseMirrorFormat(content.heading)
    ? normalizeToMarkdown(content.heading)
    : typeof content.heading === "string"
    ? content.heading
    : createCtaContent().heading;
  
  const body = isLegacyProseMirrorFormat(content.body)
    ? normalizeToMarkdown(content.body)
    : typeof content.body === "string"
    ? content.body
    : createCtaContent().body;
  
  const result = CtaContentSchema.safeParse({
    ...content,
    heading,
    body,
  });

  if (result.success) {
    return result.data;
  }

  return createCtaContent();
};
