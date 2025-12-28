import { nanoid } from "nanoid";
import type { Row } from "@/types/presentation";
import { BLOCK_TYPES, createFeatureListContent } from "../blocks/definitions";
import type { Block } from "@/types/presentation";

export const ServicesListLayout = {
  id: "services-list-layout",
  name: "Services List",
  description: "Six-item service capabilities grid covering advisory, integration, data, security, development, and support offerings.",
  icon: "IconTools",
  getRows: (): Row[] => {
    const header: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content:
        '## Comprehensive Capabilities {.center}\n\nWe don\'t just provide software. We provide the end-to-end partnership required for transformation. {.center}',
    };

    const features = createFeatureListContent();
    features.features = [
      {
        icon: "IconCompass",
        title: "Strategic Advisory",
        description:
          "Expert guidance on roadmap planning, digital transformation strategy, and change management.",
      },
      {
        icon: "IconSettings",
        title: "Seamless Integration",
        description:
          "Pre-built connectors for Salesforce, SAP, and legacy mainframes. We handle the plumbing.",
      },
      {
        icon: "IconChartBar",
        title: "Data Optimization",
        description:
          "Cleanse, enrich, and structure your data to unlock actionable insights from day one.",
      },
      {
        icon: "IconLockCheck",
        title: "Enterprise Security",
        description:
          "SOC2 Type II compliant, SSO ready, and fully auditable access logs for your compliance team.",
      },
      {
        icon: "IconPalette",
        title: "Custom Development",
        description:
          "Need something unique? Our solutions engineering team builds bespoke modules to fit your niche.",
      },
      {
        icon: "IconUsers",
        title: "24/7 Dedicated Support",
        description:
          "Round-the-clock access to senior engineers, not just a helpdesk script. We are your partners.",
      },
    ];
    features.layout = "grid";
    features.columns = 3;

    return [
      {
        id: nanoid(),
        blocks: [header],
      },
      {
        id: nanoid(),
        blocks: [
          { id: nanoid(), type: BLOCK_TYPES.FEATURE_LIST, content: features },
        ],
      },
    ];
  },
};
