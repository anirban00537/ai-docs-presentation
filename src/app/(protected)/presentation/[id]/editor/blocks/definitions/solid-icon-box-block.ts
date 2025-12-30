import { BlockContent, BLOCK_TYPES } from "@/types/presentation";
import { SolidIconBoxContentSchema } from "@/types/presentation/schemas/blocks";

export const getDefaultSolidIconBoxEditorContent = (): string =>
  "### Iconic Feature\n\nHighlight essential capabilities with visual cues. An icon paired with clear text creates immediate recognition and value.";

export const createSolidIconBoxContent = (icon?: string): any => ({
  type: BLOCK_TYPES.SOLID_ICON_BOX_BLOCK,
  icon: icon || "star",
  editorContent: getDefaultSolidIconBoxEditorContent(),
});

export const normalizeSolidIconBoxContent = (content: unknown): any => {
  const parsed = SolidIconBoxContentSchema.safeParse(content);
  if (parsed.success) {
    return parsed.data;
  }
  return createSolidIconBoxContent();
};
