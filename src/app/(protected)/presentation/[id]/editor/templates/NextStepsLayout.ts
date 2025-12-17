import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import { BLOCK_TYPES, createTimelineContent } from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";
import { createParagraphContent } from "../blocks/definitions/common";

export const NextStepsLayout = {
  id: "next-steps-layout",
  name: "Next Steps",
  description: "Outline the next three actions to take",
  icon: "➡️",
  getRows: (): Row[] => {
    const header: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "## The Path Forward\n\nWe are ready to move fast. Here is our proposed 30-day onboarding plan to get your team live and realizing value.",
    };

    const timeline = createTimelineContent();
    timeline.title = undefined;
    timeline.steps = [
      {
        title: createParagraphContent("Week 1: Kickoff & Strategy"),
        description: createParagraphContent("Align stakeholders, define success metrics, and finalise technical requirements. Delivery: Project Charter."),
        icon: "🏁",
      },
      {
        title: createParagraphContent("Week 2: Integration & Setup"),
        description: createParagraphContent("Connect data sources, configure RBAC, and set up the sandbox environment. Delivery: Functional Sandbox."),
        icon: "🔌",
      },
      {
        title: createParagraphContent("Week 3: Training & UAT"),
        description: createParagraphContent("Train power users and conduct User Acceptance Testing. Gather feedback and refine. Delivery: UAT Sign-off."),
        icon: "👨‍🏫",
      },
      {
        title: createParagraphContent("Week 4: Go Live!"),
        description: createParagraphContent("Full production launch, post-launch hypercare support, and celebration. Delivery: Live System."),
        icon: "🚀",
      },
    ];

    return [
      {
        id: nanoid(),
        blocks: [header],
      },
      {
        id: nanoid(),
        blocks: [
          { id: nanoid(), type: BLOCK_TYPES.TIMELINE, content: timeline },
        ],
      },
    ];
  },
};
