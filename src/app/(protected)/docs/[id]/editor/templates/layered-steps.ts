import { BLOCK_TYPES } from "../blocks/definitions";
import {
  createBlockInstance,
  createRow,
} from "@/app/(protected)/docs/[id]/engine/registry/factories";
import { createProseMirrorDoc } from "@/types/presentation/schemas/blocks";
import { createLayeredNumberContent } from "../blocks/definitions/layered-number-block";
import { Slide } from "@/store/slices/slidesSlice";

export const layeredStepsTemplate: Slide = {
  id: "layered-steps-layout",
  rows: [
    createRow([
      createBlockInstance(BLOCK_TYPES.PROSEMIRROR, {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 3, textAlign: "center" },
            content: [{ type: "text", text: "Process Phases" }],
          },
        ],
      }),
    ]),
    createRow([
      createBlockInstance(
        BLOCK_TYPES.LAYERED_NUMBER_BLOCK,
        createLayeredNumberContent(2)
      ),
    ]),
  ],
  accent: {
    url: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974&auto=format&fit=crop",
    position: "right",
    size: 40,
  },
};
