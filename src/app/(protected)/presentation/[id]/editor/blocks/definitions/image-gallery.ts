import { ImageGalleryContentSchema, type ImageGalleryContent } from "@/types/presentation";

export const createImageGalleryContent = (): ImageGalleryContent => ({
  type: "image-gallery",
  images: [],
  layout: "masonry",
  columns: 3,
});

export const normalizeImageGalleryContent = (content: any): ImageGalleryContent => {
  const result = ImageGalleryContentSchema.safeParse(content);
  if (result.success) {
    return result.data;
  }
  
  return {
    type: "image-gallery",
    images: Array.isArray(content?.images) ? content.images : [],
    layout: content?.layout === "grid" ? "grid" : "masonry",
    columns: (content?.columns >= 2 && content?.columns <= 4) ? content.columns : 3,
  };
};
