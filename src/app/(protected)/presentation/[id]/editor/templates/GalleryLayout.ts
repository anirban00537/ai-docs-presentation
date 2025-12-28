import { nanoid } from "nanoid";
import type { Row } from "@/types/presentation";
import { BLOCK_TYPES, createImageGalleryContent } from "../blocks/definitions";
import type { Block } from "@/types/presentation";

export const GalleryLayout = {
  id: "gallery-layout",
  name: "Image Gallery",
  description: "Showcase multiple images in a beautiful grid",
  icon: "IconPhoto",
  getRows: (): Row[] => {
    // Row 1: Section Title
    const headerBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content:
        '## Visualizing Success {.center}\n\nA look at our recent high-impact deployments. {.center}',
    };

    // Row 2: Gallery
    const gallery = createImageGalleryContent();
    gallery.columns = 3;
    gallery.images = [
      {
        id: nanoid(),
        url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop",
        caption: "Data Visualization"
      },
      {
        id: nanoid(),
        url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop",
        caption: "Business Analytics"
      },
      {
        id: nanoid(),
        url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1000&auto=format&fit=crop",
        caption: "System Monitoring"
      },
    ];

    return [
      {
        id: nanoid(),
        blocks: [headerBlock],
      },
      {
        id: nanoid(),
        blocks: [
          { id: nanoid(), type: BLOCK_TYPES.IMAGE_GALLERY, content: gallery },
        ],
      },
    ];
  },
};
