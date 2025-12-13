import type { ProseMirrorDocument } from "./common";

export interface NumberCardContent {
  type: "number-card";
  icon?: string;
  number?: number;
  size?: "small" | "medium" | "large";
  editorContent: ProseMirrorDocument;
}

export const getDefaultNumberCardEditorContent = (): ProseMirrorDocument => ({
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 3 },
      content: [{ type: "text", text: "Title" }],
    },
    {
      type: "paragraph",
      content: [{ type: "text", text: "Description" }],
    },
  ],
});

export const createNumberCardContent = (): NumberCardContent => ({
  type: "number-card",
  icon: "",
  number: 1,
  size: "medium",
  editorContent: getDefaultNumberCardEditorContent(),
});

export const normalizeNumberCardContent = (
  content: any
): NumberCardContent => {
  const incoming = content as NumberCardContent | undefined;
  if (incoming?.editorContent?.type === "doc") {
    return {
      type: "number-card",
      icon: incoming.icon ?? "",
      number: incoming.number ?? 1,
      size: incoming.size ?? "medium",
      editorContent: incoming.editorContent,
    };
  }
  return createNumberCardContent();
};

