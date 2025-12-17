import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import { BLOCK_TYPES, createTimelineContent } from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";
import { createParagraphContent } from "../blocks/definitions/common";

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
      content: "## Our Proven Methodology\n\nWe follow a rigorous process to ensure on-time, on-budget delivery.",
    };

    // Row 2: Timeline
    const timeline = createTimelineContent();
    timeline.title = createParagraphContent("The 4-Step Agile Flow");
    timeline.steps = [
      {
        title: createParagraphContent("Discovery & Audit"),
        description: createParagraphContent("We interview key stakeholders and audit existing infrastructure to identify gaps and opportunities."),
        icon: "🔍",
      },
      {
        title: createParagraphContent("Architecture & Design"),
        description: createParagraphContent("We create a comprehensive blueprint, including technical specs, UI/UX mocks, and a data migration plan."),
        icon: "📐",
      },
      {
        title: createParagraphContent("Development & QA"),
        description: createParagraphContent("Our engineers build in two-week sprints, with continuous integration and automated testing at every step."),
        icon: "💻",
      },
      {
        title: createParagraphContent("Launch & Optimization"),
        description: createParagraphContent("We execute a phased rollout, monitoring performance metrics and gathering user feedback for immediate iteration."),
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
            type: BLOCK_TYPES.TIMELINE,
            content: timeline,
          },
        ],
      },
    ];
  },
};
