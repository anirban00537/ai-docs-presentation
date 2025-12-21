import { nanoid } from "nanoid";
import type { Row, Block } from "@/types/presentation";
import type { LayoutTemplate } from "@/types/presentation";
import { BLOCK_TYPES } from "../blocks/definitions";

export const SummaryLayout: LayoutTemplate = {
  id: "summary-layout",
  name: "Summary",
  description: "Executive summary with key points organized in two columns.",
  icon: "📋",
  getRows: (): Row[] => {
    const headerBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: '<h1 style="text-align: center">Summary</h1>',
    };

    const createCard = (num: number, title: string, description: string): Block => {
      const editorContent = `**${title}**: ${description}`;

      return {
        id: nanoid(),
        type: BLOCK_TYPES.SIMPLE_NUMBER_CARD,
        content: {
          type: "simple-number-card",
          number: num,
          editorContent,
        },
      };
    };

    return [
      {
        id: nanoid(),
        blocks: [headerBlock],
      },
      {
        id: nanoid(),
        blocks: [
          createCard(
            1,
            "Major Insight",
            "This overarching insight sets the stage for the entire analysis, capturing the most significant trend or conclusion. By providing a clear and specific data point here, you anchor the audience's understanding and establish immediate credibility for the data that follows."
          ),
          createCard(
            5,
            "Performance Distinction",
            "There is a marked difference between top performers and the rest of the pack. This section delves into the specific behaviors, strategies, and resource allocations that drive superior outcomes, offering actionable benchmarks for others to aspire to."
          ),
        ],
      },
      {
        id: nanoid(),
        blocks: [
          createCard(
            2,
            "Secondary Observation",
            "While the primary insight grabs headlines, this secondary observation reveals a critical nuance in user behavior. It explains what the majority of the segment is experiencing, shedding light on adoption hurdles or sentiment shifts that might otherwise be overlooked."
          ),
          createCard(
            6,
            "Structural Takeaway",
            "Success isn't just about effort; it's about structure. We've identified key operational changes—such as streamlined workflows or new tool integrations—that successful teams are adopting to scale their results more efficiently and consistently."
          ),
        ],
      },
      {
        id: nanoid(),
        blocks: [
          createCard(
            3,
            "Early Signal",
            "We are seeing promising early indicators from recent initiatives. Although these programs are not yet fully mature, the initial data suggests measurable benefits in engagement and efficiency, pointing toward a positive ROI as we continue to scale these efforts."
          ),
          createCard(
            7,
            "Forward-looking Insight",
            "Looking ahead, the data points to a significant shift in market priorities. Organizations should prepare for these changes by adapting their strategies now, ensuring they are well-positioned to capitalize on emerging opportunities in the coming quarters."
          ),
        ],
      },
      {
        id: nanoid(),
        blocks: [
          createCard(
            4,
            "Validation",
            "Our product improvements have been validated through rigorous user testing and feedback loops. The metrics confirm that recent changes are solving core user problems, reducing friction, and leading to higher satisfaction scores across the board."
          ),
          createCard(
            8,
            "Future Readiness",
            "Finally, this analysis serves as a roadmap for future readiness. The trends identified effectively signal what is coming next, allowing proactive leaders to adjust their roadmaps, allocate resources wisely, and stay ahead of the curve."
          ),
        ],
      },
    ];
  },
};
