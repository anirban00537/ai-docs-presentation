import { BlockContent, BLOCK_TYPES } from "@/types/presentation";
import { SolidBoxContentSchema } from "@/types/presentation/schemas/blocks";

export const getDefaultSolidBoxEditorContent = (): string =>
  "### Solid Foundation\n\nStrong blocks build reliable structures. Use this space to emphasize key takeaways or standard content with a solid presence.";

export const createSolidBoxContent = (): any => ({
  type: BLOCK_TYPES.SOLID_BOX_BLOCK,
  editorContent: getDefaultSolidBoxEditorContent(),
});

export const normalizeSolidBoxContent = (content: unknown): any => {
  const parsed = SolidBoxContentSchema.safeParse(content);
  if (parsed.success) {
    return parsed.data;
  }
  return createSolidBoxContent();
};
