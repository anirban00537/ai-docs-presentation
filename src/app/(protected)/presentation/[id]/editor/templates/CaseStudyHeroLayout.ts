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
  description: "Success story with visual proof on the right",
  icon: "📈",
  accent: {
    position: "right",
    size: 45,
    url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
  },
  getRows: (): Row[] => {
    // Client logo
    const logo = createLogoGridContent();
    logo.logos = [
      { name: "Acme Corporation", image: "" },
    ];
    logo.columns = 3;

    // Hero metric
    const metric = createPulseMetricContent("+312%", "Revenue Growth");
    metric.trend = "up";
    metric.sparklineType = "smooth";

    // Story context - using markdown
    const storyBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "## How Acme Corp Tripled Revenue\n\nIn just 6 months, Acme Corporation transformed their sales operations, achieving record-breaking growth with our platform.\n\n*Read the full case study →*",
    };

    return [
      {
        id: nanoid(),
        blocks: [createTypedBlock(BLOCK_TYPES.LOGO_GRID, logo)],
      },
      {
        id: nanoid(),
        blocks: [createTypedBlock(BLOCK_TYPES.PULSE_METRIC, metric)],
      },
      {
        id: nanoid(),
        blocks: [storyBlock],
      },
    ];
  },
};
