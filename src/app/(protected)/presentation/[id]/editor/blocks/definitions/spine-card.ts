import { SpineCardContentSchema, type SpineCardContent, type ProseMirrorDocument } from "@/types/presentation";
import { 
  normalizeToMarkdown, 
  isLegacyProseMirrorFormat, 
} from "@/lib/markdown/prosemirror-converter";

export const getDefaultSpineCardEditorContent = (): ProseMirrorDocument =>
  "### Key Takeaway\n\nThis is a critical point that requires emphasis. The vertical spine draws the eye and separates this content from the rest of the flow.";

export const createSpineCardContent = (): SpineCardContent => ({
  type: "spine-card",
  editorContent: getDefaultSpineCardEditorContent(),
});

export const normalizeSpineCardContent = (content: any): SpineCardContent => {
  if (!content || typeof content !== "object") return createSpineCardContent();

  const editorContent = isLegacyProseMirrorFormat(content.editorContent)
    ? normalizeToMarkdown(content.editorContent)
    : typeof content.editorContent === "string"
    ? content.editorContent
    : getDefaultSpineCardEditorContent();

  const result = SpineCardContentSchema.safeParse({
    ...content,
    editorContent,
  });

  if (result.success) {
    return result.data;
  }

  return createSpineCardContent();
};
