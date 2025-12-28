import { InvertedImpactContentSchema, type InvertedImpactContent, type ProseMirrorDocument } from "@/types/presentation";
import { 
  normalizeToMarkdown, 
  isLegacyProseMirrorFormat, 
} from "@/lib/markdown/prosemirror-converter";

export const getDefaultInvertedImpactEditorContent = (): ProseMirrorDocument =>
  "### Pro Tip\n\nThis high-contrast block is designed to break the visual flow and demand attention. Use it for critical warnings, success states, or key insights.";

export const createInvertedImpactContent = (): InvertedImpactContent => ({
  type: "inverted-impact-block",
  editorContent: getDefaultInvertedImpactEditorContent(),
});

export const normalizeInvertedImpactContent = (content: any): InvertedImpactContent => {
  if (!content || typeof content !== "object") return createInvertedImpactContent();

  const editorContent = isLegacyProseMirrorFormat(content.editorContent)
    ? normalizeToMarkdown(content.editorContent)
    : typeof content.editorContent === "string"
    ? content.editorContent
    : getDefaultInvertedImpactEditorContent();

  const result = InvertedImpactContentSchema.safeParse({
    ...content,
    editorContent,
  });

  if (result.success) {
    return result.data;
  }

  return createInvertedImpactContent();
};
