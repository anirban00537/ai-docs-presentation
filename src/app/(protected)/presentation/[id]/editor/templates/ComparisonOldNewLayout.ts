import { nanoid } from "nanoid";
import type { Row } from "@/types/presentation";
import {
  BLOCK_TYPES,
  createComparisonTableContent,
} from "../blocks/definitions";
import type { Block } from "@/types/presentation";

export const ComparisonOldNewLayout = {
  id: "comparison-old-new-layout",
  name: "Old vs New",
  description: "Compare the old way with the new way",
  icon: "IconArrowsLeftRight",
  getRows: (): Row[] => {
    const intro: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content:
        '## Transforming the Workflow: Then vs. Now {.center}\n\nThe traditional approach is fraught with inefficiencies and manual bottlenecks. Our modern solution streamlines operations, reducing friction and accelerating time-to-market. {.center}',
    };

    const table = createComparisonTableContent();
    table.columns = [
      {
        name: "Legacy Process",
        price: "High Friction",
      },
      {
        name: "Our Solution",
        price: "Seamless",
      },
    ];
    table.rows = [
      {
        feature: "Data Entry",
        values: [
          "Manual, error-prone entry across multiple systems.",
          "Automated sync with 99.9% accuracy.",
        ],
      },
      {
        feature: "Collaboration",
        values: [
          "Siloed emails and disjointed feedback loops.",
          "Real-time commenting in a unified workspace.",
        ],
      },
      {
        feature: "Visibility",
        values: [
          "Opaque status updates requiring meetings.",
          "Live dashboards transparent to all stakeholders.",
        ],
      },
      {
        feature: "Scalability",
        values: [
          "Requires linear headcount growth.",
          "Elastic infrastructure that grows with you.",
        ],
      },
      {
        feature: "Compliance",
        values: [
          "Reactive audits and potential liability.",
          "Proactive, automated policy enforcement.",
        ],
      },
    ];

    return [
      {
        id: nanoid(),
        blocks: [intro],
      },
      {
        id: nanoid(),
        blocks: [
          { id: nanoid(), type: BLOCK_TYPES.COMPARISON_TABLE, content: table },
        ],
      },
    ];
  },
};
