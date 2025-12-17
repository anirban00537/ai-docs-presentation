import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import {
  BLOCK_TYPES,
  createImageGalleryContent,
} from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";

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
      content: "## Visualizing Success\n\nA look at our recent high-impact deployments.",
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
