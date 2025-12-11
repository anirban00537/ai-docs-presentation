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
  description: "Visualize workflows with a step-by-step timeline",
  icon: "⏱️",
  getRows: (): Row[] => {
    // Row 1: Section Title & Subtitle
    const headerBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2, textAlign: "center" },
            content: [{ type: "text", text: "Our Methodology" }],
          },
          {
            type: "paragraph",
            attrs: { textAlign: "center" },
            content: [
              {
                type: "text",
                text: "A systematic approach to delivering exceptional results.",
              },
            ],
          },
        ],
      },
    };

    // Row 2: Divider
    const divider = createDividerContent();
    divider.style = "dotted";
    divider.spacing = "medium";

    // Row 3: Timeline
    const timeline = createTimelineContent();
    timeline.title = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "Workflow Steps" }],
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
              content: [{ type: "text", text: "Discovery" }],
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
                  text: "We start by deeply understanding your goals and constraints.",
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
              content: [{ type: "text", text: "Strategy" }],
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
                  text: "Developing a comprehensive roadmap to success.",
                },
              ],
            },
          ],
        },
        icon: "🗺️",
      },
      {
        title: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Execution" }],
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
                  text: "Implementing the solution with precision and care.",
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
              content: [{ type: "text", text: "Launch" }],
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
                  text: "Delivering the final product to your users.",
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
        blocks: [headerBlock],
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
