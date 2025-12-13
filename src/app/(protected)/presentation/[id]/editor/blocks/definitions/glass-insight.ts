import type { ProseMirrorDocument } from "./common";
import { createParagraphContent } from "./common";

export interface GlassInsightContent {
  type: "glass-insight";
  icon: string;
  editorContent: ProseMirrorDocument;
}

export const createGlassInsightContent = (
  icon: string = "💡",
  text: string = "This is a key takeaway or insight that you want your audience to remember."
): GlassInsightContent => ({
  type: "glass-insight",
  icon,
  editorContent: createParagraphContent(text),
});

export const normalizeGlassInsightContent = (
  content: any
): GlassInsightContent => {
  const incoming = content as GlassInsightContent | undefined;
  if (incoming?.editorContent?.type === "doc") {
    return {
      type: "glass-insight",
      icon: incoming.icon ?? "💡",
      editorContent: incoming.editorContent,
    };
  }
  return createGlassInsightContent();
};
