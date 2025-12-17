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

import { normalizeToMarkdown, isLegacyProseMirrorFormat, isMarkdownFormat } from "@/lib/markdown/prosemirror-converter";

export const normalizeGlassInsightContent = (
  content: any
): GlassInsightContent => {
  const incoming = content as GlassInsightContent | undefined;
  if (incoming?.editorContent) {
    const editorContent = isMarkdownFormat(incoming.editorContent)
      ? incoming.editorContent
      : isLegacyProseMirrorFormat(incoming.editorContent)
      ? normalizeToMarkdown(incoming.editorContent)
      : createGlassInsightContent().editorContent;
    
    return {
      type: "glass-insight",
      icon: incoming.icon ?? "💡",
      editorContent,
    };
  }
  return createGlassInsightContent();
};
