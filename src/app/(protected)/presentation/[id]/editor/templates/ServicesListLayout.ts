import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import { BLOCK_TYPES, createFeatureListContent } from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";
import { createParagraphContent } from "../blocks/definitions/common";

export const ServicesListLayout = {
  id: "services-list-layout",
  name: "Services List",
  description: "Grid of services or offerings",
  icon: "🛠️",
  getRows: (): Row[] => {
    const header: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "<h2 style=\"text-align: center\">Comprehensive Capabilities</h2>\n\n<p style=\"text-align: center\">We don't just provide software. We provide the end-to-end partnership required for transformation.</p>",
    };

    const features = createFeatureListContent();
    features.features = [
      {
        icon: "🧭",
        title: createParagraphContent("Strategic Advisory"),
        description: createParagraphContent("Expert guidance on roadmap planning, digital transformation strategy, and change management."),
      },
      {
        icon: "⚙️",
        title: createParagraphContent("Seamless Integration"),
        description: createParagraphContent("Pre-built connectors for Salesforce, SAP, and legacy mainframes. We handle the plumbing."),
      },
      {
        icon: "📊",
        title: createParagraphContent("Data Optimization"),
        description: createParagraphContent("Cleanse, enrich, and structure your data to unlock actionable insights from day one."),
      },
      {
        icon: "🔒",
        title: createParagraphContent("Enterprise Security"),
        description: createParagraphContent("SOC2 Type II compliant, SSO ready, and fully auditable access logs for your compliance team."),
      },
      {
        icon: "🎨",
        title: createParagraphContent("Custom Development"),
        description: createParagraphContent("Need something unique? Our solutions engineering team builds bespoke modules to fit your niche."),
      },
      {
        icon: "🤝",
        title: createParagraphContent("24/7 Dedicated Support"),
        description: createParagraphContent("Round-the-clock access to senior engineers, not just a helpdesk script. We are your partners."),
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
