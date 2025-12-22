import { nanoid } from "nanoid";
import type { Row } from "@/types/presentation";
import { BLOCK_TYPES, createImageGalleryContent } from "../blocks/definitions";
import type { Block } from "@/types/presentation";

export const ProblemImageLayout = {
  id: "problem-image-layout",
  name: "Problem with Visual",
  description: "Problem statement paired with an illustrative image",
  icon: "🖼️",
  getRows: (): Row[] => {
    const copy: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content:
        '<h2 style="text-align: center">Complexity is Killing Agility</h2>\n\n<p style="text-align: center">Your teams are spending 40% of their time navigating bureaucratic red tape instead of shipping products.</p>\n\n<p style="text-align: center">This visual represents the tangled web of dependencies currently slowing you down.</p>',
    };

    const image = createImageGalleryContent();
    image.layout = "masonry";
    image.columns = 2;
    image.images = [
      {
        id: nanoid(),
        url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=60",
        caption: "Visual diagram of a complex, tangled workflow process.",
      },
      {
        id: nanoid(),
        url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=60",
        caption: "The impact of inefficiencies on timeline.",
      },
    ];

    return [
      {
        id: nanoid(),
        blocks: [copy],
      },
      {
        id: nanoid(),
        blocks: [
          { id: nanoid(), type: BLOCK_TYPES.IMAGE_GALLERY, content: image },
        ],
      },
    ];
  },
};
