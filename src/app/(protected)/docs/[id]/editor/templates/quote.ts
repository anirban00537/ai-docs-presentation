import { BLOCK_TYPES } from "../blocks/definitions";
import { createBlockInstance, createRow } from "@/app/(protected)/docs/[id]/engine/registry/factories";
import { createProseMirrorDoc } from "@/types/presentation/schemas/blocks";
import { Slide } from "@/store/slices/slidesSlice";

export const quoteTemplate: Slide = {
  id: "quote-layout",
  rows: [
    createRow([
      createBlockInstance(BLOCK_TYPES.PROSEMIRROR, {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2, textAlign: "center" },
            content: [{ type: "text", text: "Inspiration" }],
          },
        ],
      }),
    ]),
    createRow([
      createBlockInstance(BLOCK_TYPES.PROSEMIRROR, {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "> \"Design is not just what it looks like and feels like. Design is how it works.\"",
              },
            ],
          },
          {
            type: "paragraph",
            attrs: { textAlign: "right" },
            content: [{ type: "text", text: "— Steve Jobs" }],
          },
        ],
      }),
    ]),
  ],
  accent: {
    url: "https://images.unsplash.com/photo-1618004652321-13a63e576b80?q=80&w=1974&auto=format&fit=crop",
    position: "left",
    size: 25,
  },
};
