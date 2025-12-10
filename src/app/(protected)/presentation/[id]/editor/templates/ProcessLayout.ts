import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import {
  BLOCK_TYPES,
  createTimelineContent,
  createDividerContent,
} from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";

export const ProcessLayout = {
  id: "process-layout",
  name: "Process & Timeline",
  description: "Show step-by-step process with timeline visualization",
  icon: "⏱️",
  getRows: (): Row[] => {
    // Row 1: Section Title
    const titleBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "How It Works" }],
          },
        ],
      },
    };

    // Row 2: Description
    const descriptionBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Our proven methodology ensures success at every stage of your journey.",
              },
            ],
          },
        ],
      },
    };

    // Row 3: Divider
    const divider = createDividerContent();
    divider.style = "solid";
    divider.spacing = "small";

    // Row 4: Timeline
    const timeline = createTimelineContent();
    timeline.title = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Our Methodology" }],
        },
      ],
    };
    timeline.steps = [
      {
        title: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Discovery & Planning" }],
            },
          ],
        },
        description: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "We begin by understanding your goals, challenges, and requirements through comprehensive analysis.",
                },
              ],
            },
          ],
        },
        icon: "🔍",
      },
      {
        title: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Design & Strategy" }],
            },
          ],
        },
        description: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Our team creates a tailored solution architecture and strategic roadmap aligned with your objectives.",
                },
              ],
            },
          ],
        },
        icon: "🎨",
      },
      {
        title: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Implementation" }],
            },
          ],
        },
        description: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "We execute the plan with precision, maintaining clear communication and iterative feedback loops.",
                },
              ],
            },
          ],
        },
        icon: "⚙️",
      },
      {
        title: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Launch & Support" }],
            },
          ],
        },
        description: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "We ensure smooth deployment and provide ongoing support to maximize your success and growth.",
                },
              ],
            },
          ],
        },
        icon: "🚀",
      },
    ];

    return [
      {
        id: nanoid(),
        blocks: [titleBlock],
      },
      {
        id: nanoid(),
        blocks: [descriptionBlock],
      },
      {
        id: nanoid(),
        blocks: [
          {
            id: nanoid(),
            type: BLOCK_TYPES.DIVIDER,
            content: divider,
          },
        ],
      },
      {
        id: nanoid(),
        blocks: [
          {
            id: nanoid(),
            type: BLOCK_TYPES.TIMELINE,
            content: timeline,
          },
        ],
      },
    ];
  },
};
