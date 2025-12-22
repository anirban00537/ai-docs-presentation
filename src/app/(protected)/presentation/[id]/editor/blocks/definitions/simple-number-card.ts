import { SimpleNumberCardContentSchema, type SimpleNumberCardContent } from "@/types/presentation";

import { 
  normalizeToMarkdown, 
  isLegacyProseMirrorFormat, 
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
  if (!content || typeof content !== "object") return createSimpleNumberCardContent();

  const editorContent = isLegacyProseMirrorFormat(content.editorContent)
    ? normalizeToMarkdown(content.editorContent)
    : typeof content.editorContent === "string"
    ? content.editorContent
    : createSimpleNumberCardContent().editorContent;
  
  const result = SimpleNumberCardContentSchema.safeParse({
    ...content,
    editorContent,
  });

  if (result.success) {
    return result.data;
  }

  return createSimpleNumberCardContent();
};
