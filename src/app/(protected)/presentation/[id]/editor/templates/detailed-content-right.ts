import { BLOCK_TYPES } from "../blocks/definitions";
import { createBlockInstance, createRow } from "@/app/(protected)/presentation/[id]/editor/engine/registry/factories";
import { createProseMirrorDoc } from "@/types/presentation/schemas/blocks";
import { Slide } from "@/store/slices/slidesSlice";

export const detailedContentRightTemplate: Slide = {
  id: "detailed-content-right",
  rows: [
    createRow([
      createBlockInstance(
        BLOCK_TYPES.PROSEMIRROR,
        createProseMirrorDoc("Detailed Overview", "heading", 3)
      ),
    ]),
    createRow([
      createBlockInstance(
        BLOCK_TYPES.PROSEMIRROR,
        createProseMirrorDoc(
          "This analysis encompasses multiple layers of investigation. We begin with foundational research, examining primary sources and establishing a baseline understanding of the domain.",
          "paragraph"
        )
      ),
    ]),
    createRow([
      createBlockInstance(
        BLOCK_TYPES.PROSEMIRROR,
        createProseMirrorDoc(
          "Our findings reveal several significant patterns. First, there is a clear correlation between input variables and output metrics.",
          "paragraph"
        )
      ),
    ]),
  ],
  accent: {
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop",
    position: "right",
    size: 28,
  },
};
