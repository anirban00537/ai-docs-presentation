import { GlassInsightContentSchema, type GlassInsightContent } from "@/types/presentation";

import { 
  normalizeToMarkdown, 
  isLegacyProseMirrorFormat, 
} from "@/lib/markdown/prosemirror-converter";

export const createGlassInsightContent = (
  icon: string = "💡",
  text: string = "This is a key takeaway or insight that you want your audience to remember."
): GlassInsightContent => ({
  type: "glass-insight",
  icon,
  editorContent: text,
});

export const normalizeGlassInsightContent = (
  content: any
): GlassInsightContent => {
  if (!content || typeof content !== "object") return createGlassInsightContent();

  const editorContent = isLegacyProseMirrorFormat(content.editorContent)
    ? normalizeToMarkdown(content.editorContent)
    : typeof content.editorContent === "string"
    ? content.editorContent
    : createGlassInsightContent().editorContent;
  
  const result = GlassInsightContentSchema.safeParse({
    ...content,
    editorContent,
  });

  if (result.success) {
    return result.data;
  }

  return createGlassInsightContent();
};
