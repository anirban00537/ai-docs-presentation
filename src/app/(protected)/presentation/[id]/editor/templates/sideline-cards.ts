import { BLOCK_TYPES } from "../blocks/definitions";
import { createBlockInstance, createRow } from "@/app/(protected)/presentation/[id]/engine/registry/factories";
import { createProseMirrorDoc } from "@/types/presentation/schemas/blocks";
import { createSidelineCardContent } from "../blocks/definitions/sideline-card-block";
import { Slide } from "@/store/slices/slidesSlice";

export const sidelineCardsTemplate: Slide = {
  id: "sideline-card-layout",
  rows: [
    createRow([
      createBlockInstance(BLOCK_TYPES.PROSEMIRROR, {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2, textAlign: "center" },
            content: [{ type: "text", text: "Key Insights" }],
          },
        ],
      }),
    ]),
    createRow([
      createBlockInstance(BLOCK_TYPES.SIDELINE_CARD_BLOCK, createSidelineCardContent(3)),
    ]),
  ],
  accent: {
    url: "https://images.unsplash.com/photo-1618005198914-c3b6f1f11ac6?q=80&w=1974&auto=format&fit=crop",
    position: "left",
    size: 28,
  },
};
