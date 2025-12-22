import { nanoid } from "nanoid";
import type { Row } from "@/types/presentation";
import { BLOCK_TYPES, createImageGalleryContent } from "../blocks/definitions";
import type { Block } from "@/types/presentation";

export const GalleryLayout = {
  id: "gallery-layout",
  name: "Image Gallery",
  description: "Showcase multiple images in a beautiful grid",
  icon: "🖼️",
  getRows: (): Row[] => {
    // Row 1: Section Title
    const headerBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content:
        '<h2 style="text-align: center">Visualizing Success</h2>\n\n<p style="text-align: center">A look at our recent high-impact deployments.</p>',
    };

    // Row 2: Gallery
    const gallery = createImageGalleryContent();
    gallery.columns = 3;
    gallery.images = [
      { id: nanoid(), url: "", caption: "Deployment Dashboard" },
      { id: nanoid(), url: "", caption: "Real-time Analytics" },
      { id: nanoid(), url: "", caption: "Mobile Experience" },
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
