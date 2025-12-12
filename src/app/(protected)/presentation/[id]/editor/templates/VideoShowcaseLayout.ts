import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import { BLOCK_TYPES, createVideoContent } from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";

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
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2, textAlign: "center" },
            content: [{ type: "text", text: "See It In Action" }],
          },
          {
            type: "paragraph",
            attrs: { textAlign: "center" },
            content: [
              {
                type: "text",
                text: "Watch how our platform can transform your workflow",
              },
            ],
          },
        ],
      },
    };

    // Row 2: Video Block
    const video = createVideoContent();
    video.source = "youtube";
    video.url = "";
    video.title = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Product Demo",
            },
          ],
        },
      ],
    };

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
