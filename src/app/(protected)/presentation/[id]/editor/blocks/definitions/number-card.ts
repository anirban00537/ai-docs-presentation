import { NumberCardContent, ProseMirrorDocument } from "@/types/presentation";
import { 
  normalizeToMarkdown, 
  isLegacyProseMirrorFormat, 
  isMarkdownFormat 
} from "@/lib/markdown/prosemirror-converter";

export const getDefaultNumberCardEditorContent = (): ProseMirrorDocument =>
  "### Title\n\nDescription";

export const createNumberCardContent = (): NumberCardContent => ({
  type: "number-card",
  icon: "",
  number: 1,
  size: "medium",
  editorContent: getDefaultNumberCardEditorContent(),
});

export const normalizeNumberCardContent = (content: any): NumberCardContent => {
  const incoming = content as NumberCardContent | undefined;
  if (incoming?.editorContent) {
    // Handle both Markdown string and legacy JSON
    const editorContent = isMarkdownFormat(incoming.editorContent)
      ? incoming.editorContent
      : isLegacyProseMirrorFormat(incoming.editorContent)
      ? normalizeToMarkdown(incoming.editorContent)
      : getDefaultNumberCardEditorContent();

    return {
      type: "number-card",
      icon: incoming.icon ?? "",
      number: incoming.number ?? 1,
      size: incoming.size ?? "medium",
      editorContent,
    };
  }
  return createNumberCardContent();
};
