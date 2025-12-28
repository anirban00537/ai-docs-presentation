import { CornerCutContentSchema, type CornerCutContent, type ProseMirrorDocument } from "@/types/presentation";
import { 
  normalizeToMarkdown, 
  isLegacyProseMirrorFormat, 
} from "@/lib/markdown/prosemirror-converter";

export const getDefaultCornerCutEditorContent = (): ProseMirrorDocument =>
  "### Architectural Design\n\nThe unique corner cut adds a geometric edge to your layout, perfect for technical specs or modern branding.";

export const createCornerCutContent = (label: string = "TIP"): CornerCutContent => ({
  type: "corner-cut-block",
  label,
  editorContent: getDefaultCornerCutEditorContent(),
});

export const normalizeCornerCutContent = (content: any): CornerCutContent => {
  if (!content || typeof content !== "object") return createCornerCutContent();

  const editorContent = isLegacyProseMirrorFormat(content.editorContent)
    ? normalizeToMarkdown(content.editorContent)
    : typeof content.editorContent === "string"
    ? content.editorContent
    : getDefaultCornerCutEditorContent();

  const result = CornerCutContentSchema.safeParse({
    ...content,
    editorContent,
  });

  if (result.success) {
    return result.data;
  }

  return createCornerCutContent(content.label);
};
