import { nanoid } from "nanoid";
import { BLOCK_TYPES } from "../blocks/definitions";
import { createBlockInstance, createRow } from "@/app/(protected)/docs/[id]/engine/registry/factories";
import { createProseMirrorDoc } from "@/types/presentation/schemas/blocks";
import { Slide } from "@/store/slices/slidesSlice";

export const introductionTemplate: Slide = {
  id: "introduction",
  rows: [
    createRow([
      createBlockInstance(BLOCK_TYPES.SPACER, {
        type: "spacer",
        height: 120,
      }),
    ]),
    createRow([
      createBlockInstance(
        BLOCK_TYPES.PROSEMIRROR,
        {
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 1, textAlign: "center" },
              content: [{ type: "text", text: "Presentation Title" }],
            },
            {
              type: "paragraph",
              attrs: { textAlign: "center" },
              content: [{ type: "text", text: "Supporting subtitle or abstract about your topic" }],
            },
          ],
        }
      ),
    ]),
    createRow([
      createBlockInstance(BLOCK_TYPES.SPACER, {
        type: "spacer",
        height: 120,
      }),
    ]),
  ],
};
