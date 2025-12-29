import { ModernPillCardContentSchema, type ModernPillCardContent, type ProseMirrorDocument } from "@/types/presentation";
import { 
  normalizeToMarkdown, 
  isLegacyProseMirrorFormat, 
} from "@/lib/markdown/prosemirror-converter";

export const getDefaultModernPillEditorContent = (): ProseMirrorDocument =>
  "### Feature Highlights\n\nCategorize your content with a sleek pill label. This block is excellent for feature lists, new announcements, or step-by-step guides.";

export const createModernPillCardContent = (
  label: string = "NEW"
): ModernPillCardContent => ({
  type: "modern-pill-card",
  label,
  editorContent: getDefaultModernPillEditorContent(),
});

export const normalizeModernPillCardContent = (content: any): ModernPillCardContent => {
  if (!content || typeof content !== "object") return createModernPillCardContent();

  const editorContent = isLegacyProseMirrorFormat(content.editorContent)
    ? normalizeToMarkdown(content.editorContent)
    : typeof content.editorContent === "string"
    ? content.editorContent
    : getDefaultModernPillEditorContent();

  const result = ModernPillCardContentSchema.safeParse({
    ...content,
    editorContent,
  });

  if (result.success) {
    return result.data;
  }

  return createModernPillCardContent(content.label);
};
