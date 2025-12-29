import { StepCardContentSchema, type StepCardContent, type ProseMirrorDocument } from "@/types/presentation";
import { 
  normalizeToMarkdown, 
  isLegacyProseMirrorFormat, 
} from "@/lib/markdown/prosemirror-converter";

export const getDefaultStepCardEditorContent = (): ProseMirrorDocument => 
  "Add your step content here.";

export const createStepCardContent = (stepNumber: number = 1): StepCardContent => ({
  type: "step-card-block",
  stepNumber,
  editorContent: getDefaultStepCardEditorContent(),
});

export const normalizeStepCardContent = (content: any): StepCardContent => {
  if (!content || typeof content !== "object") return createStepCardContent(1);

  const editorContent = isLegacyProseMirrorFormat(content.editorContent)
    ? normalizeToMarkdown(content.editorContent)
    : typeof content.editorContent === "string"
    ? content.editorContent
    : getDefaultStepCardEditorContent();

  const result = StepCardContentSchema.safeParse({
    ...content,
    editorContent,
  });

  if (result.success) {
    return result.data;
  }

  return createStepCardContent(content?.stepNumber ?? 1);
};
