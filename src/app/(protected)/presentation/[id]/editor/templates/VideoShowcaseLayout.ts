import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import { BLOCK_TYPES, createVideoContent } from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";
import { createParagraphContent } from "../blocks/definitions/common";

export const VideoShowcaseLayout = {
  id: "video-showcase-layout",
  name: "Video Showcase",
  description: "Embed videos to showcase your product",
  icon: "🎥",
  getRows: (): Row[] => {
    // Row 1: Section Title
    const headerBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "## The Future of Work\n\nA 2-minute overview of where we are going next.",
    };

    // Row 2: Video Block
    const video = createVideoContent();
    video.source = "youtube";
    video.url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"; // Placeholder, but valid URL structure
    video.title = createParagraphContent("Keynote 2024 Highlights");

    return [
      {
        id: nanoid(),
        blocks: [headerBlock],
      },
      {
        id: nanoid(),
        blocks: [{ id: nanoid(), type: BLOCK_TYPES.VIDEO, content: video }],
      },
    ];
  },
};
