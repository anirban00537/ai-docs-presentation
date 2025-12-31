import { nanoid } from "nanoid";
import type { Row, LayoutTemplate } from "@/types/presentation";
import { BLOCK_TYPES, createCodeContent } from "../blocks/definitions";
import { createSectionHeader, createProseMirrorBlock } from "./template-utils";

export const SimpleCodeLayout: LayoutTemplate = {
  id: "simple-code-layout",
  name: "Title, Code & Description",
  description: "Technical slide with code snippet and explanation text.",
  icon: "IconCode",
  accent: {
    url: "https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?q=80&w=1964&auto=format&fit=crop",
    position: "right",
    size: 32,
  },
  getRows: (): Row[] => {
    const titleBlock = createProseMirrorBlock(
      createSectionHeader(
        "Code Example",
        "Understanding the implementation details.",
        2
      )
    );

    const codeBlock = {
      id: nanoid(),
      type: BLOCK_TYPES.CODE,
      content: createCodeContent(),
    };

    const descriptionBlock = createProseMirrorBlock(
      "This code demonstrates a key concept. Add your explanation here to help the audience understand the logic, purpose, and any important nuances."
    );

    return [
      {
        id: nanoid(),
        blocks: [titleBlock],
      },
      {
        id: nanoid(),
        blocks: [codeBlock],
      },
      {
        id: nanoid(),
        blocks: [descriptionBlock],
      },
    ];
  },
};
