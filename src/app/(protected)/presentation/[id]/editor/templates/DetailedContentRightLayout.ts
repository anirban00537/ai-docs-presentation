import { nanoid } from "nanoid";
import type { Row, LayoutTemplate } from "@/types/presentation";
import { createProseMirrorBlock } from "./template-utils";

export const DetailedContentRightLayout: LayoutTemplate = {
  id: "detailed-content-right",
  name: "Detailed Content - Right Accent",
  description: "Text-heavy layout with extensive explanations and right accent.",
  icon: "IconAlignRight",
  accent: {
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop",
    position: "right",
    size: 30,
  },
  getRows: (): Row[] => {
    return [
      {
        id: nanoid(),
        blocks: [
          createProseMirrorBlock("### Comprehensive Analysis\n\nAn in-depth examination of complex issues and methodologies.")
        ],
      },
      {
        id: nanoid(),
        blocks: [
          createProseMirrorBlock(
            "#### Detailed Breakdown\n\nThis analysis encompasses multiple layers of investigation. We begin with foundational research, examining primary sources and establishing a baseline understanding of the domain.\n\nThe methodology employed combines qualitative and quantitative approaches, ensuring comprehensive coverage of all relevant aspects. Data collection follows rigorous protocols, with validation checks at each stage.\n\nOur findings reveal several significant patterns. First, there is a clear correlation between input variables and output metrics. Second, temporal factors play a crucial role in determining outcomes. Third, contextual elements cannot be overlooked when interpreting results."
          )
        ],
      },
      {
        id: nanoid(),
        blocks: [
          createProseMirrorBlock(
            "#### Implications and Recommendations\n\nBased on these findings, we recommend a multi-faceted approach that addresses both immediate concerns and long-term strategic objectives. Implementation should proceed in phases, with continuous monitoring and adaptation as conditions evolve.\n\n**Next Steps:** Review findings with stakeholders, establish implementation timeline, allocate resources accordingly."
          )
        ],
      },
    ];
  },
};
