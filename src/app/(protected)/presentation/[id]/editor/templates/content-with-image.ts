import { BLOCK_TYPES } from "../blocks/definitions";
import { createBlockInstance, createRow } from "@/app/(protected)/presentation/[id]/engine/registry/factories";
import { createProseMirrorDoc } from "@/types/presentation/schemas/blocks";
import { Slide } from "@/store/slices/slidesSlice";

export const contentWithImageTemplate: Slide = {
  id: "content-with-image-layout",
  rows: [
    createRow([
      createBlockInstance(
        BLOCK_TYPES.PROSEMIRROR,
        {
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 2, textAlign: "center" },
              content: [{ type: "text", text: "Product Visuals" }],
            },
          ],
        }
      ),
    ]),
    createRow([
      createBlockInstance(BLOCK_TYPES.PROSEMIRROR, createProseMirrorDoc("Visual elements help convey complex ideas quickly. Add supporting context here.")),
    ]),
    createRow([
      createBlockInstance(BLOCK_TYPES.IMAGE, {
        type: "image",
        url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop",
        alt: "Mockup",
        caption: "A visual representation of the concept.",
        objectFit: "cover",
      }),
    ]),
  ],
  accent: {
    url: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974&auto=format&fit=crop",
    position: "right",
    size: 35,
  },
};
