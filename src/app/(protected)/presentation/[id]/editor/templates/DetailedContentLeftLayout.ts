import { nanoid } from "nanoid";
import type { Row, LayoutTemplate } from "@/types/presentation";
import { createProseMirrorBlock } from "./template-utils";

export const DetailedContentLeftLayout: LayoutTemplate = {
  id: "detailed-content-left",
  name: "Detailed Content - Left Accent",
  description: "Text-heavy layout with multiple paragraphs and left accent.",
  icon: "IconAlignLeft",
  accent: {
    url: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=1974&auto=format&fit=crop",
    position: "left",
    size: 28,
  },
  getRows: (): Row[] => {
    return [
      {
        id: nanoid(),
        blocks: [
          createProseMirrorBlock("### Main Topic\n\nA comprehensive overview of the subject matter at hand.")
        ],
      },
      {
        id: nanoid(),
        blocks: [
          createProseMirrorBlock(
            "#### Key Points\n\nThis section provides detailed information about the core concepts. We explore multiple dimensions of the topic, examining various perspectives and implications.\n\nThe first major consideration involves understanding the foundational principles. These principles form the basis for all subsequent analysis and decision-making processes.\n\nSecondly, we must consider the practical applications. Real-world implementation requires careful planning, resource allocation, and stakeholder coordination."
          )
        ],
      },
      {
        id: nanoid(),
        blocks: [
          createProseMirrorBlock(
            "#### Additional Context\n\nFurther elaboration on supporting details and contextual factors that influence outcomes. This includes historical precedents, current trends, and future projections.\n\n*Important note: All data should be verified against primary sources.*"
          )
        ],
      },
    ];
  },
};
