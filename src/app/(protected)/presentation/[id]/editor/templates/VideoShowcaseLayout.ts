/**
 * Video Showcase Layout Template
 * Embed videos to showcase your product or content.
 * 
 * @example
 * Used for: Product demos, Video content, Keynote highlights
 */

import { nanoid } from "nanoid";
import type { Row, LayoutTemplate } from "@/types/presentation";
import { BLOCK_TYPES, createVideoContent } from "../blocks/definitions";
import { createProseMirrorBlock, createSectionHeader, createTypedBlock } from "./template-utils";

export const VideoShowcaseLayout: LayoutTemplate = {
  id: "video-showcase-layout",
  name: "Video Showcase",
  description: "Embed videos to showcase your product",
  icon: "IconVideo",
  getRows: (): Row[] => {
    // Row 1: Section Title
    const headerBlock = createProseMirrorBlock(
      createSectionHeader(
        "The Future of Work",
        "A 2-minute overview of where we are going next."
      )
    );

    // Row 2: Video Block
    const video = createVideoContent();
    video.source = "youtube";
    // Using a placeholder pattern - replace with actual video URL
    video.url = "https://www.youtube.com/watch?v=YOUR_VIDEO_ID";
    video.title = "Keynote 2024 Highlights";

    return [
      {
        id: nanoid(),
        blocks: [headerBlock],
      },
      {
        id: nanoid(),
        blocks: [createTypedBlock(BLOCK_TYPES.VIDEO, video)],
      },
    ];
  },
};
