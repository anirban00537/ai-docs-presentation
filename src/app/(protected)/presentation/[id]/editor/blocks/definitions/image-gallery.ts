import { ImageGalleryContent } from "@/types/presentation";

export const createImageGalleryContent = (): ImageGalleryContent => ({
  type: "image-gallery",
  images: [],
  layout: "masonry",
  columns: 3,
});

export const normalizeImageGalleryContent = (content: any): ImageGalleryContent => {
  return {
    type: "image-gallery",
    images: Array.isArray(content?.images) ? content.images : [],
    layout: content?.layout === "grid" ? "grid" : "masonry",
    columns: [2, 3, 4].includes(content?.columns) ? content.columns : 3,
  };
};
