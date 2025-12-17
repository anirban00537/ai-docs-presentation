import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import { BLOCK_TYPES, createFeatureListContent } from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";
import { createParagraphContent } from "../blocks/definitions/common";

export const TargetAudiencesLayout = {
  id: "target-audiences-layout",
  name: "Target Audiences",
  description: "Highlight who this is for",
  icon: "🎯",
  getRows: (): Row[] => {
    const heading: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "## Who Wins With Us\n\nWe solve critical pain points for every level of the organization, ensuring alignment from day one.",
    };

    const audiences = createFeatureListContent();
    audiences.features = [
      {
        icon: "💻",
        title: createParagraphContent("Engineering Leads"),
        description: createParagraphContent("Eliminate boilerplate code and reduce technical debt with our standardized SDKs and APIs."),
      },
      {
        icon: "🚀",
        title: createParagraphContent("Product Managers"),
        description: createParagraphContent("Accelerate time-to-market by 2x. Ship features, not infrastructure, and iterate based on real user data."),
      },
      {
        icon: "💰",
        title: createParagraphContent("Sales Leaders"),
        description: createParagraphContent("Unblock deals faster by passing security reviews instantly with our pre-certified compliance module."),
      },
      {
        icon: "👔",
        title: createParagraphContent("C-Suite"),
        description: createParagraphContent("Gain real-time visibility into ROI and operational efficiency across the entire global portfolio."),
      },
    ];
    audiences.layout = "grid";
    audiences.columns = 2;

    return [
      {
        id: nanoid(),
        blocks: [heading],
      },
      {
        id: nanoid(),
        blocks: [
          { id: nanoid(), type: BLOCK_TYPES.FEATURE_LIST, content: audiences },
        ],
      },
    ];
  },
};
