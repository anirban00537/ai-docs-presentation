import { BLOCK_TYPES } from "../blocks/definitions";
import { createBlockInstance, createRow } from "../blocks/factories";
import { Slide } from "@/store/slices/slidesSlice";

export const blankTemplate: Slide = {
  id: "blank",
  rows: [
    createRow([
      createBlockInstance(BLOCK_TYPES.PROSEMIRROR, ""),
    ]),
  ],
};
