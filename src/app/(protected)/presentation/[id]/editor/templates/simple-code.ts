import { BLOCK_TYPES } from "../blocks/definitions";
import { createBlockInstance, createRow } from "@/app/(protected)/presentation/[id]/editor/engine/registry/factories";
import { createProseMirrorDoc } from "@/types/presentation/schemas/blocks";
import { createCodeContent } from "../blocks/definitions/code";
import { Slide } from "@/store/slices/slidesSlice";

export const simpleCodeTemplate: Slide = {
  id: "simple-code-layout",
  rows: [
    createRow([
      createBlockInstance(BLOCK_TYPES.PROSEMIRROR, createProseMirrorDoc("Code Example", "heading", 2)),
    ]),
    createRow([
      createBlockInstance(BLOCK_TYPES.CODE, {
        ...createCodeContent(),
        code: "const greeting = 'Hello Butterfast!';\nconsole.log(greeting);",
        language: "javascript",
      }),
    ]),
    createRow([
      createBlockInstance(BLOCK_TYPES.PROSEMIRROR, createProseMirrorDoc("Basic syntax for immediate testing and prototyping.")),
    ]),
  ],
  accent: {
    url: "https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?q=80&w=1964&auto=format&fit=crop",
    position: "right",
    size: 25,
  },
};
