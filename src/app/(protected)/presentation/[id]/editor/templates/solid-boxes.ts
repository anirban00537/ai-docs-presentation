import { BLOCK_TYPES } from "../blocks/definitions";
import { createBlockInstance, createRow } from "@/app/(protected)/presentation/[id]/editor/engine/registry/factories";
import { createProseMirrorDoc } from "@/types/presentation/schemas/blocks";
import { createSolidBoxContent } from "../blocks/definitions/solid-box-block";
import { Slide } from "@/store/slices/slidesSlice";

export const solidBoxesTemplate: Slide = {
  id: "solid-box-layout",
  rows: [
    createRow([
      createBlockInstance(BLOCK_TYPES.PROSEMIRROR, {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2, textAlign: "center" },
            content: [{ type: "text", text: "Strategic Pillars" }],
          },
        ],
      }),
    ]),
    createRow([
      createBlockInstance(BLOCK_TYPES.SOLID_BOX_BLOCK, createSolidBoxContent(3)),
    ]),
  ],
  accent: {
    url: "https://images.unsplash.com/photo-1618005891825-37449c57c799?q=80&w=1932&auto=format&fit=crop",
    position: "background",
    size: 15,
  },
};
