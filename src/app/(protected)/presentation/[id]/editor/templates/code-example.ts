import { BLOCK_TYPES } from "../blocks/definitions";
import { createBlockInstance, createRow } from "@/app/(protected)/presentation/[id]/engine/registry/factories";
import { createProseMirrorDoc } from "@/types/presentation/schemas/blocks";
import { createCodeContent } from "../blocks/definitions/code";
import { Slide } from "@/store/slices/slidesSlice";

export const codeExampleTemplate: Slide = {
  id: "code-example-layout",
  rows: [
    createRow([
      createBlockInstance(BLOCK_TYPES.PROSEMIRROR, {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2, textAlign: "center" },
            content: [{ type: "text", text: "Robust SDK" }],
          },
        ],
      }),
    ]),
    createRow([
      createBlockInstance(BLOCK_TYPES.CODE, {
        ...createCodeContent(),
        code: "import { Butterfast } from '@butterfast/sdk';\n\nconst client = new Butterfast();\nawait client.init();",
        language: "javascript",
        theme: "dark",
      }),
    ]),
  ],
};
