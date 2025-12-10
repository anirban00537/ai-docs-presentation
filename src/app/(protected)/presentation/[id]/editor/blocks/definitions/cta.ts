import type { ProseMirrorDocument } from "./common";

export interface CtaContent {
  type: "cta";
  heading: ProseMirrorDocument;
  body: ProseMirrorDocument;
  buttonLabel: string;
}

export const createCtaContent = (): CtaContent => ({
  type: "cta",
  heading: {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Call to action" }],
      },
    ],
  },
  body: {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: "Describe the benefit here." }],
      },
    ],
  },
  buttonLabel: "Get started",
});

const hasValidDoc = (doc?: ProseMirrorDocument) =>
  doc?.type === "doc" && Array.isArray(doc.content);

export const normalizeCtaContent = (content: any): CtaContent => {
  const incoming = content as CtaContent | undefined;
  if (
    incoming &&
    hasValidDoc(incoming.heading) &&
    hasValidDoc(incoming.body)
  ) {
    return {
      type: "cta",
      heading: incoming.heading,
      body: incoming.body,
      buttonLabel: incoming.buttonLabel ?? "Get started",
    };
  }
  return createCtaContent();
};

