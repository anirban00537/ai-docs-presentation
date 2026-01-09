import { BLOCK_TYPES } from "../blocks/definitions";
import { createBlockInstance, createRow } from "@/app/(protected)/presentation/[id]/engine/registry/factories";
import { createProseMirrorDoc } from "@/types/presentation/schemas/blocks";
import { Slide } from "@/store/slices/slidesSlice";

export const detailedContentBackgroundTemplate: Slide = {
  id: "detailed-content-background",
  rows: [
    createRow([
      createBlockInstance(
        BLOCK_TYPES.PROSEMIRROR,
        createProseMirrorDoc("Executive Analysis", "heading", 3)
      ),
    ]),
    createRow([
      createBlockInstance(
        BLOCK_TYPES.PROSEMIRROR,
        createProseMirrorDoc(
          "This document presents a thorough analysis of our strategic position, examining both current state and future trajectories.",
          "paragraph"
        )
      ),
    ]),
  ],
  accent: {
    url: "https://images.unsplash.com/photo-1618005891825-37449c57c799?q=80&w=1932&auto=format&fit=crop",
    position: "background",
    size: 12,
  },
};
