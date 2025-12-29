import { LayeredNumberContentSchema, type LayeredNumberContent, type ProseMirrorDocument } from "@/types/presentation";
import { 
  normalizeToMarkdown, 
  isLegacyProseMirrorFormat, 
} from "@/lib/markdown/prosemirror-converter";

export const getDefaultLayeredNumberEditorContent = (): ProseMirrorDocument =>
  "### Step One\n\nBegin by defining your core objective. The large background number adds depth and clearly indicates sequence without cluttering the foreground.";

export const createLayeredNumberContent = (number: number = 1): LayeredNumberContent => ({
  type: "layered-number-block",
  number,
  editorContent: getDefaultLayeredNumberEditorContent(),
});

export const normalizeLayeredNumberContent = (content: any): LayeredNumberContent => {
  if (!content || typeof content !== "object") return createLayeredNumberContent();

  const editorContent = isLegacyProseMirrorFormat(content.editorContent)
    ? normalizeToMarkdown(content.editorContent)
    : typeof content.editorContent === "string"
    ? content.editorContent
    : getDefaultLayeredNumberEditorContent();

  const result = LayeredNumberContentSchema.safeParse({
    ...content,
    editorContent,
  });

  if (result.success) {
    return result.data;
  }

  return createLayeredNumberContent(content.number);
};
