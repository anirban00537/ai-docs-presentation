export interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface ImageGalleryContent {
  images: GalleryImage[];
  layout: "grid" | "masonry";
  columns: 2 | 3 | 4;
}

export const createImageGalleryContent = (): ImageGalleryContent => ({
  images: [],
  layout: "masonry",
  columns: 3,
});

export const normalizeImageGalleryContent = (content: any): ImageGalleryContent => {
  return {
    images: Array.isArray(content?.images) ? content.images : [],
    layout: content?.layout === "grid" ? "grid" : "masonry",
    columns: [2, 3, 4].includes(content?.columns) ? content.columns : 3,
  };
};
