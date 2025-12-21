import { CtaContent, ProseMirrorDocument } from "@/types/presentation";
import { 
  normalizeToMarkdown, 
  isLegacyProseMirrorFormat, 
  isMarkdownFormat 
} from "@/lib/markdown/prosemirror-converter";

export const createCtaContent = (): CtaContent => ({
  type: "cta",
  heading: '<h2 style="text-align: center">Call to action</h2>',
  body: '<p style="text-align: center">Describe the benefit here.</p>',
  buttonLabel: "Get started",
});

export const normalizeCtaContent = (content: any): CtaContent => {
  const incoming = content as CtaContent | undefined;
  if (incoming) {
    const heading = isMarkdownFormat(incoming.heading)
      ? incoming.heading
      : isLegacyProseMirrorFormat(incoming.heading)
      ? normalizeToMarkdown(incoming.heading)
      : createCtaContent().heading;
    
    const body = isMarkdownFormat(incoming.body)
      ? incoming.body
      : isLegacyProseMirrorFormat(incoming.body)
      ? normalizeToMarkdown(incoming.body)
      : createCtaContent().body;
    
    return {
      type: "cta",
      heading,
      body,
      buttonLabel: incoming.buttonLabel ?? "Get started",
      buttonLink: incoming.buttonLink,
    };
  }
  return createCtaContent();
};
