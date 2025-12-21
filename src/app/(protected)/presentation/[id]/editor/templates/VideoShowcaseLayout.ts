import { nanoid } from "nanoid";
import type { Row } from "@/types/presentation";
import { BLOCK_TYPES, createVideoContent } from "../blocks/definitions";
import type { Block } from "@/types/presentation";
import { createParagraphContent } from "@/types/presentation";

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
      content: "<h2 style=\"text-align: center\">The Future of Work</h2>\n\n<p style=\"text-align: center\">A 2-minute overview of where we are going next.</p>",
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
