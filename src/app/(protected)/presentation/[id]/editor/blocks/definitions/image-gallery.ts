import { ImageGalleryContentSchema, type ImageGalleryContent } from "@/types/presentation";
import { nanoid } from "nanoid";

export const createImageGalleryContent = (): ImageGalleryContent => ({
  type: "image-gallery",
  images: [
    {
      id: nanoid(),
      url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop",
      caption: "Data Visualization"
    },
    {
      id: nanoid(),
      url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1000&auto=format&fit=crop",
      caption: "Professional Workspace"
    },
    {
      id: nanoid(),
      url: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f3fd?q=80&w=1000&auto=format&fit=crop",
      caption: "Analytics Review"
    }
  ],
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
