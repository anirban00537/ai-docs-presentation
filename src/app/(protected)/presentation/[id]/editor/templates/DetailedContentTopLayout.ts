import { nanoid } from "nanoid";
import type { Row, LayoutTemplate } from "@/types/presentation";
import { createProseMirrorBlock } from "./template-utils";

export const DetailedContentTopLayout: LayoutTemplate = {
  id: "detailed-content-top",
  name: "Detailed Content - Top Accent",
  description: "Article-style layout with header accent and flowing content.",
  icon: "IconLayoutNavbar",
  accent: {
    url: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?q=80&w=1974&auto=format&fit=crop",
    position: "top",
    size: 22,
  },
  getRows: (): Row[] => {
    return [
      {
        id: nanoid(),
        blocks: [
          createProseMirrorBlock("### Article Title\n\nSubheading providing context and framing for the content below.")
        ],
      },
      {
        id: nanoid(),
        blocks: [
          createProseMirrorBlock(
            "The opening paragraph sets the stage for what follows. It introduces key concepts, establishes the narrative framework, and prepares readers for the detailed discussion ahead. This section should be engaging yet informative, balancing accessibility with depth.\n\nAs we delve deeper into the subject matter, several themes emerge. These themes interconnect in complex ways, creating a rich tapestry of meaning that rewards careful examination. The relationship between theory and practice becomes particularly evident when we consider specific case studies and real-world applications.\n\nFurthermore, it is essential to acknowledge the broader context within which these developments occur. Historical precedents inform current understanding, while emerging trends point toward future possibilities. The interplay between continuity and change defines much of what we observe in this domain."
          )
        ],
      },
      {
        id: nanoid(),
        blocks: [
          createProseMirrorBlock(
            "#### Concluding Thoughts\n\nIn summary, the evidence supports a nuanced interpretation that recognizes both opportunities and challenges. Moving forward, a balanced approach that incorporates lessons from past experience while remaining open to innovation will likely prove most effective.\n\n*For further reading, consult the reference materials provided in the appendix.*"
          )
        ],
      },
    ];
  },
};
