/**
 * Case Study Hero Layout Template
 * Case study showcase with client visual on the right.
 * 
 * @example
 * Used for: Case studies, Success stories, Client showcases
 */

import { nanoid } from "nanoid";
import type { Row, LayoutTemplate, Block } from "@/types/presentation";
import { BLOCK_TYPES, createPulseMetricContent, createLogoGridContent } from "../blocks/definitions";
import { createTypedBlock } from "./template-utils";

export const CaseStudyHeroLayout: LayoutTemplate = {
  id: "case-study-hero-layout",
  name: "Case Study Hero",
  description: "Impactful success story with metrics and proof",
  icon: "IconChartLine",
  accent: {
    position: "right",
    size: 50,
    url: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1600", // Meeting/Success context
  },
  getRows: (): Row[] => {
    // Client Logo Area
    const logo = createLogoGridContent();
    logo.logos = [
        { name: "Acme Corp", image: "" }, 
    ];
    // We use a small grid just for the main client logo to give it presence
    logo.columns = 3; 

    // Main Story Header
    const storyBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "# How Acme Corp Tripled Revenue\n\nAcme Corp was struggling with siloed data and slow reporting. By implementing our **DataSynergy Platform**, they unified their analytics stack in just 3 weeks.",
    };

    // Hero Metric - Highlighting the result
    const metric = createPulseMetricContent("+312%", "Year-over-Year Revenue Growth");
    metric.trend = "up";
    metric.sparklineType = "smooth";

    // Secondary Metrics/Key Results using markdown list
    const resultsBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "### Key Outcomes\n\n*   **40% Reduction** in operational costs\n*   **2.5x Faster** time-to-market for new features\n*   **98% Employee Satisfaction** with the new tools\n\n[Read the full case study →](#)",
    };

    return [
      {
        id: nanoid(),
        blocks: [createTypedBlock(BLOCK_TYPES.LOGO_GRID, logo)],
      },
      {
        id: nanoid(),
        blocks: [storyBlock],
      },
      {
        id: nanoid(),
        blocks: [createTypedBlock(BLOCK_TYPES.PULSE_METRIC, metric)],
      },
      {
        id: nanoid(),
        blocks: [resultsBlock],
      },
    ];
  },
};
