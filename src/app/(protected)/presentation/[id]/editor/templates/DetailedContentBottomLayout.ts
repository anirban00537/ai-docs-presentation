import { nanoid } from "nanoid";
import type { Row, LayoutTemplate } from "@/types/presentation";
import { createProseMirrorBlock } from "./template-utils";

export const DetailedContentBottomLayout: LayoutTemplate = {
  id: "detailed-content-bottom",
  name: "Detailed Content - Bottom Accent",
  description: "Dense information layout with bottom accent for emphasis.",
  icon: "IconLayoutBottombar",
  accent: {
    url: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974&auto=format&fit=crop",
    position: "bottom",
    size: 26,
  },
  getRows: (): Row[] => {
    return [
      {
        id: nanoid(),
        blocks: [
          createProseMirrorBlock("### Research Findings\n\nDetailed presentation of data analysis and insights.")
        ],
      },
      {
        id: nanoid(),
        blocks: [
          createProseMirrorBlock(
            "#### Methodology and Approach\n\nOur research methodology combines established frameworks with innovative techniques to ensure both rigor and relevance. The study was conducted over an extended period, allowing for longitudinal observations and trend analysis.\n\nData was collected from multiple sources, including primary interviews, secondary literature reviews, and quantitative surveys. This triangulated approach enhances the validity and reliability of our conclusions.\n\nThe analytical framework employed incorporates both deductive and inductive reasoning, enabling us to test existing hypotheses while remaining open to emergent patterns and unexpected insights."
          )
        ],
      },
      {
        id: nanoid(),
        blocks: [
          createProseMirrorBlock(
            "#### Results and Discussion\n\nThe results demonstrate clear patterns across multiple variables. Statistical significance was achieved in key metrics, supporting our initial hypotheses while also revealing unexpected correlations that warrant further investigation.\n\nParticularly noteworthy is the relationship between environmental factors and performance outcomes. This finding has important implications for both theory and practice, suggesting new avenues for intervention and optimization.\n\n*Statistical confidence level: 95%. Margin of error: ±3%.*"
          )
        ],
      },
    ];
  },
};
