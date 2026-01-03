import { LayeredNumberContentSchema, type LayeredNumberContent, type LayeredNumberItem } from "@/types/presentation";
import { nanoid } from "nanoid";

export const createLayeredNumberItem = (
  number: number = 1,
  title: string = "#### Core Objective",
  description: string = "Define your core objective. The large background number adds depth and indicates sequence."
): LayeredNumberItem => ({
  id: nanoid(),
  number,
  title,
  description,
});

export const createLayeredNumberContent = (itemCount: number = 2): LayeredNumberContent => ({
  type: "layered-number-block",
  items: Array.from({ length: itemCount }, (_, i) => createLayeredNumberItem(i + 1)),
});

export const normalizeLayeredNumberContent = (content: any): LayeredNumberContent => {
  if (!content || typeof content !== "object") return createLayeredNumberContent();

  // Handle legacy single content migration
  if (content.number !== undefined && content.editorContent && !content.items) {
    return {
      type: "layered-number-block",
      items: [createLayeredNumberItem(content.number, "## Title", content.editorContent)],
    };
  }

  // Handle items migration
  let items = content.items;
  if (Array.isArray(content.items)) {
    items = content.items.map((item: any) => {
        if (item.editorContent && (!item.title || !item.description)) {
            return {
                id: item.id || nanoid(),
                number: item.number ?? 1,
                title: item.title || "## Title",
                description: item.description || item.editorContent,
            };
        }
        return {
            id: item.id || nanoid(),
            number: item.number ?? 1,
            title: item.title || "## Title",
            description: item.description || "Description",
        };
    });
  }

  const result = LayeredNumberContentSchema.safeParse({
    ...content,
    items: items || createLayeredNumberContent().items,
  });

  if (result.success) {
    return result.data;
  }

  return createLayeredNumberContent();
};
