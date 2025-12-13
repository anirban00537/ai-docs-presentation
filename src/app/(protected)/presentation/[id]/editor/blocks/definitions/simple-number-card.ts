import type { ProseMirrorDocument } from "./common";
import { createParagraphContent } from "./common";

export interface SimpleNumberCardContent {
  type: "simple-number-card";
  number: number;
  editorContent: ProseMirrorDocument;
}

export const createSimpleNumberCardContent = (
  number: number = 1,
  title: string = "Title",
  description: string = "This is a meaningful description that provides context and detail about the key point. It is long enough to span multiple lines, ensuring that the layout looks balanced and the text content is substantial enough to convey a complete thought or observation effectively."
): SimpleNumberCardContent => ({
  type: "simple-number-card",
  number,
  editorContent: {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: `${title}: `,
            marks: [{ type: "strong" }],
          },
          {
            type: "text",
            text: description,
          },
        ],
      },
    ],
  },
});

export const normalizeSimpleNumberCardContent = (
  content: any
): SimpleNumberCardContent => {
  const incoming = content as SimpleNumberCardContent | undefined;
  if (incoming?.editorContent?.type === "doc") {
    return {
      type: "simple-number-card",
      number: incoming.number ?? 1,
      editorContent: incoming.editorContent,
    };
  }
  return createSimpleNumberCardContent();
};
