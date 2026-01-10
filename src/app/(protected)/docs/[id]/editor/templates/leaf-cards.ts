import { BLOCK_TYPES } from "../blocks/definitions";
import { createBlockInstance, createRow } from "@/app/(protected)/docs/[id]/engine/registry/factories";
import { createProseMirrorDoc } from "@/types/presentation/schemas/blocks";
import { createLeafBlockContent } from "../blocks/definitions/leaf-block";
import { Slide } from "@/store/slices/slidesSlice";

export const leafCardsTemplate: Slide = {
  id: "leaf-card-layout",
  rows: [
    createRow([
      createBlockInstance(BLOCK_TYPES.PROSEMIRROR, {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2, textAlign: "center" },
            content: [{ type: "text", text: "Core Values" }],
          },
        ],
      }),
    ]),
    createRow([
      createBlockInstance(BLOCK_TYPES.LEAF_BLOCK, createLeafBlockContent(3)),
    ]),
  ],
  accent: {
    url: "https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?q=80&w=1964&auto=format&fit=crop",
    position: "right",
    size: 25,
  },
};
