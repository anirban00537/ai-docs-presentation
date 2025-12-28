import { nanoid } from "nanoid";
import type { Row } from "@/types/presentation";
import {
  BLOCK_TYPES,
  createFeatureListContent,
} from "../blocks/definitions";
import type { Block } from "@/types/presentation";

export const TargetAudiencesLayout = {
  id: "target-audiences-layout",
  name: "Target Audiences",
  description: "Four persona cards targeting Engineering, Product, Sales, and C-Suite with role-specific value propositions. Stakeholder alignment slide.",
  icon: "IconTarget",
  getRows: (): Row[] => {
    const heading: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content:
        '## Who Wins With Us {.center}\n\nWe solve critical pain points for every level of the organization, ensuring alignment from day one. {.center}',
    };

    const audiences = createFeatureListContent();
    audiences.features = [
      {
        icon: "IconDeviceLaptop",
        title: "Engineering Leads",
        description:
          "Eliminate boilerplate code and reduce technical debt with our standardized SDKs and APIs.",
      },
      {
        icon: "IconRocket",
        title: "Product Managers",
        description:
          "Accelerate time-to-market by 2x. Ship features, not infrastructure, and iterate based on real user data.",
      },
      {
        icon: "IconCash",
        title: "Sales Leaders",
        description:
          "Unblock deals faster by passing security reviews instantly with our pre-certified compliance module.",
      },
      {
        icon: "IconBriefcase",
        title: "C-Suite",
        description:
          "Gain real-time visibility into ROI and operational efficiency across the entire global portfolio.",
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
