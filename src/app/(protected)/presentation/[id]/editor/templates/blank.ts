import { BLOCK_TYPES } from "../blocks/definitions";
import { createBlockInstance, createRow } from "@/app/(protected)/presentation/[id]/engine/registry/factories";
import { Slide } from "@/store/slices/slidesSlice";

export const blankTemplate: Slide = {
  id: "blank",
  rows: [
    createRow([
      createBlockInstance(BLOCK_TYPES.PROSEMIRROR, ""),
    ]),
  ],
};
