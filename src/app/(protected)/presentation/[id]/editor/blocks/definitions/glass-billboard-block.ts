import { GlassBillboardContentSchema, type GlassBillboardContent, type ProseMirrorDocument } from "@/types/presentation";
import { 
  normalizeToMarkdown, 
  isLegacyProseMirrorFormat, 
} from "@/lib/markdown/prosemirror-converter";

export const getDefaultGlassBillboardEditorContent = (): ProseMirrorDocument =>
  "## \"The only way to do great work is to love what you do.\"";

export const createGlassBillboardContent = (): GlassBillboardContent => ({
  type: "glass-billboard-block",
  editorContent: getDefaultGlassBillboardEditorContent(),
});

export const normalizeGlassBillboardContent = (content: any): GlassBillboardContent => {
  if (!content || typeof content !== "object") return createGlassBillboardContent();

  const editorContent = isLegacyProseMirrorFormat(content.editorContent)
    ? normalizeToMarkdown(content.editorContent)
    : typeof content.editorContent === "string"
    ? content.editorContent
    : getDefaultGlassBillboardEditorContent();

  const result = GlassBillboardContentSchema.safeParse({
    ...content,
    editorContent,
  });

  if (result.success) {
    return result.data;
  }

  return createGlassBillboardContent();
};
