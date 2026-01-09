import { BLOCK_TYPES } from "../blocks/definitions";
import { createBlockInstance, createRow } from "@/app/(protected)/presentation/[id]/engine/registry/factories";
import { createProseMirrorDoc } from "@/types/presentation/schemas/blocks";
import { createTimelineBentoContent } from "../blocks/definitions/timeline-bento-block";
import { Slide } from "@/store/slices/slidesSlice";

export const timelineBentoTemplate: Slide = {
  id: "timeline-bento-layout",
  rows: [
    createRow([
      createBlockInstance(BLOCK_TYPES.PROSEMIRROR, {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2, textAlign: "center" },
            content: [{ type: "text", text: "Evolution Timeline" }],
          },
        ],
      }),
    ]),
    createRow([
      createBlockInstance(BLOCK_TYPES.TIMELINE_BENTO_BLOCK, createTimelineBentoContent(4)),
    ]),
  ],
  accent: {
    url: "https://images.unsplash.com/photo-1618556658017-c3b0c1d87a69?q=80&w=1964&auto=format&fit=crop",
    position: "top",
    size: 20,
  },
};
