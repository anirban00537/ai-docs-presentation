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
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2, textAlign: "center" },
            content: [{ type: "text", text: "Our Work" }],
          },
        ],
      },
    };

    // Row 2: Gallery
    const gallery = createImageGalleryContent();
    // Start with empty gallery or maybe 1 placeholder if needed, usually empty is fine for user to add
    gallery.columns = 3;

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
