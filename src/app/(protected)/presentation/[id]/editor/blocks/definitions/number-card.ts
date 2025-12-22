import { NumberCardContentSchema, type NumberCardContent, type ProseMirrorDocument } from "@/types/presentation";
import { 
  normalizeToMarkdown, 
  isLegacyProseMirrorFormat, 
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
  if (!content || typeof content !== "object") return createNumberCardContent();

  const editorContent = isLegacyProseMirrorFormat(content.editorContent)
    ? normalizeToMarkdown(content.editorContent)
    : typeof content.editorContent === "string"
    ? content.editorContent
    : getDefaultNumberCardEditorContent();

  const result = NumberCardContentSchema.safeParse({
    ...content,
    editorContent,
  });

  if (result.success) {
    return result.data;
  }

  return createNumberCardContent();
};
