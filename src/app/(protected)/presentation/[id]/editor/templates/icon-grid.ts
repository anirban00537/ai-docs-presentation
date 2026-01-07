import { BLOCK_TYPES } from "../blocks/definitions";
import { createBlockInstance, createRow } from "../blocks/factories";
import { createProseMirrorDoc } from "@/types/presentation/schemas/blocks";
import { createSolidIconBoxContent } from "../blocks/definitions/solid-icon-box-block";
import { Slide } from "@/store/slices/slidesSlice";

export const iconGridTemplate: Slide = {
  id: "icon-box-layout",
  rows: [
    createRow([
      createBlockInstance(
        BLOCK_TYPES.PROSEMIRROR,
        {
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 2, textAlign: "center" },
              content: [{ type: "text", text: "Core Features" }],
            },
            {
              type: "paragraph",
              attrs: { textAlign: "center" },
              content: [{ type: "text", text: "Explore the powerful capabilities that drive our solution forward." }],
            },
          ],
        }
      ),
    ]),
    createRow([
      createBlockInstance(
        BLOCK_TYPES.SOLID_ICON_BOX_BLOCK,
        createSolidIconBoxContent(3)
      ),
    ]),
  ],
  accent: {
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop",
    position: "right",
    size: 35,
  },
};
