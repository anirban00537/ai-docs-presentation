import { BLOCK_TYPES, type SolidBoxContent, type SolidBoxItem } from "@/types/presentation";
import { SolidBoxContentSchema } from "@/types/presentation/schemas/blocks";
import { nanoid } from "nanoid";

export const createSolidBoxItem = (
  title: string = "#### Major Point",
  description: string = "Standard content with a solid presence. Strong blocks build reliable structures."
): SolidBoxItem => ({
  id: nanoid(),
  title,
  description,
});

export const createSolidBoxContent = (itemCount: number = 3): SolidBoxContent => ({
  type: BLOCK_TYPES.SOLID_BOX_BLOCK,
  items: Array.from({ length: itemCount }, () => createSolidBoxItem()),
});

export const normalizeSolidBoxContent = (content: any): SolidBoxContent => {
  if (!content || typeof content !== "object") return createSolidBoxContent();

  // Handle legacy single content migration
  if (content.editorContent && !content.items) {
    return {
      type: BLOCK_TYPES.SOLID_BOX_BLOCK,
      items: [createSolidBoxItem("## Point", content.editorContent)],
    };
  }

  // Handle items migration
  let items = content.items;
  if (Array.isArray(content.items)) {
    items = content.items.map((item: any) => {
        if (item.editorContent && (!item.title || !item.description)) {
            return {
                id: item.id || nanoid(),
                title: item.title || "## Title",
                description: item.description || item.editorContent,
            };
        }
        return {
            id: item.id || nanoid(),
            title: item.title || "## Title",
            description: item.description || "Description",
        };
    });
  }

  const result = SolidBoxContentSchema.safeParse({
    ...content,
    items: items || createSolidBoxContent().items,
  });

  if (result.success) {
    return result.data;
  }

  return createSolidBoxContent();
};
