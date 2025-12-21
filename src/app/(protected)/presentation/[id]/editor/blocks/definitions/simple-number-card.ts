import { SimpleNumberCardContent, ProseMirrorDocument } from "@/types/presentation";
import { createParagraphContent } from "@/types/presentation";
import { 
  normalizeToMarkdown, 
  isLegacyProseMirrorFormat, 
  isMarkdownFormat 
} from "@/lib/markdown/prosemirror-converter";

export const createSimpleNumberCardContent = (
  number: number = 1,
  title: string = "Title",
  description: string = "This is a meaningful description that provides context and detail about the key point. It is long enough to span multiple lines, ensuring that the layout looks balanced and the text content is substantial enough to convey a complete thought or observation effectively."
): SimpleNumberCardContent => ({
  type: "simple-number-card",
  number,
  editorContent: `**${title}**: ${description}`,
});

export const normalizeSimpleNumberCardContent = (
  content: any
): SimpleNumberCardContent => {
  const incoming = content as SimpleNumberCardContent | undefined;
  if (incoming?.editorContent) {
    const editorContent = isMarkdownFormat(incoming.editorContent)
      ? incoming.editorContent
      : isLegacyProseMirrorFormat(incoming.editorContent)
      ? normalizeToMarkdown(incoming.editorContent)
      : createSimpleNumberCardContent().editorContent;
    
    return {
      type: "simple-number-card",
      number: incoming.number ?? 1,
      editorContent,
    };
  }
  return createSimpleNumberCardContent();
};
