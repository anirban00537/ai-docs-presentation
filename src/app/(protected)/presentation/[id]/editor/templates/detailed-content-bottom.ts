import { BLOCK_TYPES } from "../blocks/definitions";
import { createBlockInstance, createRow } from "@/app/(protected)/presentation/[id]/engine/registry/factories";
import { createProseMirrorDoc } from "@/types/presentation/schemas/blocks";
import { Slide } from "@/store/slices/slidesSlice";

export const detailedContentBottomTemplate: Slide = {
  id: "detailed-content-bottom",
  rows: [
    createRow([
      createBlockInstance(
        BLOCK_TYPES.PROSEMIRROR,
        createProseMirrorDoc("Bottom Insights", "heading", 3)
      ),
    ]),
    createRow([
      createBlockInstance(
        BLOCK_TYPES.PROSEMIRROR,
        createProseMirrorDoc(
          "Our research methodology combines established frameworks with innovative techniques to ensure both rigor and relevance.",
          "paragraph"
        )
      ),
    ]),
  ],
  accent: {
    url: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974&auto=format&fit=crop",
    position: "bottom",
    size: 26,
  },
};
