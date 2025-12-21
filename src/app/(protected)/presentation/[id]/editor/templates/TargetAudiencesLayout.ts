import { nanoid } from "nanoid";
import type { Row } from "@/types/presentation";
import { BLOCK_TYPES, createFeatureListContent } from "../blocks/definitions";
import type { Block } from "@/types/presentation";

export const TargetAudiencesLayout = {
  id: "target-audiences-layout",
  name: "Target Audiences",
  description: "Highlight who this is for",
  icon: "🎯",
  getRows: (): Row[] => {
    const heading: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "<h2 style=\"text-align: center\">Who Wins With Us</h2>\n\n<p style=\"text-align: center\">We solve critical pain points for every level of the organization, ensuring alignment from day one.</p>",
    };

    const audiences = createFeatureListContent();
    audiences.features = [
      {
        icon: "💻",
        title: "Engineering Leads",
        description: "Eliminate boilerplate code and reduce technical debt with our standardized SDKs and APIs.",
      },
      {
        icon: "🚀",
        title: "Product Managers",
        description: "Accelerate time-to-market by 2x. Ship features, not infrastructure, and iterate based on real user data.",
      },
      {
        icon: "💰",
        title: "Sales Leaders",
        description: "Unblock deals faster by passing security reviews instantly with our pre-certified compliance module.",
      },
      {
        icon: "👔",
        title: "C-Suite",
        description: "Gain real-time visibility into ROI and operational efficiency across the entire global portfolio.",
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
