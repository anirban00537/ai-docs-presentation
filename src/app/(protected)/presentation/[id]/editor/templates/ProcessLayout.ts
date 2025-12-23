import { nanoid } from "nanoid";
import type { Row } from "@/types/presentation";
import { BLOCK_TYPES, createTimelineContent } from "../blocks/definitions";
import type { Block } from "@/types/presentation";

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
      content:
        '<h2 style="text-align: center">Our Proven Methodology</h2>\n\n<p style="text-align: center">We follow a rigorous process to ensure on-time, on-budget delivery.</p>',
    };

    // Row 2: Timeline
    const timeline = createTimelineContent();
    timeline.title = "The 4-Step Agile Flow";
    timeline.steps = [
      {
        title: "Discovery & Audit",
        description:
          "We interview key stakeholders and audit existing infrastructure to identify gaps and opportunities.",
      },
      {
        title: "Architecture & Design",
        description:
          "We create a comprehensive blueprint, including technical specs, UI/UX mocks, and a data migration plan.",
      },
      {
        title: "Development & QA",
        description:
          "Our engineers build in two-week sprints, with continuous integration and automated testing at every step.",
      },
      {
        title: "Launch & Optimization",
        description:
          "We execute a phased rollout, monitoring performance metrics and gathering user feedback for immediate iteration.",
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
            type: BLOCK_TYPES.TIMELINE,
            content: timeline,
          },
        ],
      },
    ];
  },
};
