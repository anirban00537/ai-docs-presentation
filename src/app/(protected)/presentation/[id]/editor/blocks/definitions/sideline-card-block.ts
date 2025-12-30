import { BlockContent, BLOCK_TYPES } from "@/types/presentation";
import { SidelineCardContentSchema } from "@/types/presentation/schemas/blocks";

export const getDefaultSidelineCardEditorContent = (): string =>
  "### Key Insight\n\nUse this card to highlight important takeaways. The vertical accent draws attention while maintaining a clean, structured look.";

export const createSidelineCardContent = (): any => ({
  type: BLOCK_TYPES.SIDELINE_CARD_BLOCK,
  editorContent: getDefaultSidelineCardEditorContent(),
});

export const normalizeSidelineCardContent = (content: unknown): any => {
  const parsed = SidelineCardContentSchema.safeParse(content);
  if (parsed.success) {
    return parsed.data;
  }
  return createSidelineCardContent();
};
