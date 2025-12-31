import { nanoid } from "nanoid";
import type { Row, LayoutTemplate } from "@/types/presentation";
import { createProseMirrorBlock } from "./template-utils";

export const BlankLayout: LayoutTemplate = {
  id: "blank",
  name: "Blank",
  description: "Start from scratch with a completely empty slide.",
  icon: "IconSquare",
  getRows: (): Row[] => {
    return [
      {
        id: nanoid(),
        blocks: [createProseMirrorBlock("")],
      },
    ];
  },
};
