import { CalloutContentSchema, type CalloutContent, type ProseMirrorDocument } from "@/types/presentation";
import { 
  normalizeToMarkdown, 
  isLegacyProseMirrorFormat, 
} from "@/lib/markdown/prosemirror-converter";

export const getDefaultCalloutEditorContent = (variant: string): ProseMirrorDocument => {
  switch(variant) {
    case 'info': return "Here is some helpful information or context relating to this slide.";
    case 'warning': return "Be mindful of this potential pitfall or important requirement.";
    case 'error': return "PAY ATTENTION: This is a critical error or destructive action warning.";
    case 'success': return "Great job! This indicates a successful outcome or completed step.";
    case 'question': return "What are the main implications of this strategy?";
    case 'note':
    default: return "Just a quick note to remember for later.";
  }
};

export const createCalloutContent = (variant: CalloutContent['variant'] = "note"): CalloutContent => ({
  type: "callout-block",
  variant,
  editorContent: getDefaultCalloutEditorContent(variant),
});

export const normalizeCalloutContent = (content: any): CalloutContent => {
  if (!content || typeof content !== "object") return createCalloutContent("note");

  const editorContent = isLegacyProseMirrorFormat(content.editorContent)
    ? normalizeToMarkdown(content.editorContent)
    : typeof content.editorContent === "string"
    ? content.editorContent
    : getDefaultCalloutEditorContent(content.variant);

  const result = CalloutContentSchema.safeParse({
    ...content,
    editorContent,
  });

  if (result.success) {
    return result.data;
  }

  return createCalloutContent(content?.variant);
};
