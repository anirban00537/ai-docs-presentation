import { CtaContentSchema, type CtaContent } from "@/types/presentation";
import {
  normalizeToMarkdown,
  isLegacyProseMirrorFormat,
} from "@/lib/markdown/prosemirror-converter";

export const createCtaContent = (): CtaContent => ({
  type: "cta",
  heading: '## Call to action {.center}',
  body: 'Describe the benefit here. {.center}',
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
