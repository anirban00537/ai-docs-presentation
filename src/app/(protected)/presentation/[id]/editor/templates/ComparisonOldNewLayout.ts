import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import {
  BLOCK_TYPES,
  createComparisonTableContent,
} from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";
import { createParagraphContent } from "../blocks/definitions/common";

export const ComparisonOldNewLayout = {
  id: "comparison-old-new-layout",
  name: "Old vs New",
  description: "Compare the old way with the new way",
  icon: "⚖️",
  getRows: (): Row[] => {
    const intro: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Transforming the Workflow: Then vs. Now" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "The traditional approach is fraught with inefficiencies and manual bottlenecks. Our modern solution streamlines operations, reducing friction and accelerating time-to-market.",
              },
            ],
          },
        ],
      },
    };

    const table = createComparisonTableContent();
    table.columns = [
      { 
        name: createParagraphContent("Legacy Process"), 
        price: createParagraphContent("High Friction"), 
        highlighted: false 
      }, 
      { 
        name: createParagraphContent("Our Solution"), 
        price: createParagraphContent("Seamless"), 
        highlighted: true 
      }
    ];
    table.rows = [
      {
        feature: createParagraphContent("Data Entry"),
        values: [
            createParagraphContent("Manual, error-prone entry across multiple systems."),
            createParagraphContent("Automated sync with 99.9% accuracy.")
        ],
      },
      {
        feature: createParagraphContent("Collaboration"),
        values: [
            createParagraphContent("Siloed emails and disjointed feedback loops."),
            createParagraphContent("Real-time commenting in a unified workspace.")
        ],
      },
      {
        feature: createParagraphContent("Visibility"),
        values: [
            createParagraphContent("Opaque status updates requiring meetings."),
            createParagraphContent("Live dashboards transparent to all stakeholders.")
        ],
      },
      {
        feature: createParagraphContent("Scalability"),
        values: [
             createParagraphContent("Requires linear headcount growth."),
             createParagraphContent("Elastic infrastructure that grows with you.")
        ],
      },
       {
        feature: createParagraphContent("Compliance"),
        values: [
             createParagraphContent("Reactive audits and potential liability."),
             createParagraphContent("Proactive, automated policy enforcement.")
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
