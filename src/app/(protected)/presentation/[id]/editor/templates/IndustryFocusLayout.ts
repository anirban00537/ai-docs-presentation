/**
 * Industry Focus Layout Template
 * Market/industry slide with contextual right image.
 * 
 * @example
 * Used for: Market analysis, Industry focus slides, Vertical deep-dives
 */

import { nanoid } from "nanoid";
import type { Row, LayoutTemplate, Block } from "@/types/presentation";
import { BLOCK_TYPES, createPulseMetricContent, createFeatureListContent } from "../blocks/definitions";
import { createTypedBlock } from "./template-utils";

export const IndustryFocusLayout: LayoutTemplate = {
  id: "industry-focus-layout",
  name: "Industry Focus",
  description: "Market analysis with key metrics and industry trends. Features right-side accent with fintech/digital abstract imagery.",
  icon: "IconBuildingFactory",
  accent: {
    position: "right",
    size: 40,
    url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800", // Fintech/Digital abstract
  },
  getRows: (): Row[] => {
    // Title & Context
    const headerBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "# The Future of Digital Banking\n\nTraditional banking models are shifting. The next decade belongs to embedded finance and decentralized systems.",
    };

    // Key Market Metric
    const metric = createPulseMetricContent("$25T", "Projected Market Value by 2030");
    metric.trend = "up";
    metric.sparklineType = "bars"; // Bar chart for variety

    // Core Trends List
    const features = createFeatureListContent();
    features.features = [
      { icon: "IconDeviceMobile", title: "Neobank Adoption", description: "Expected to reach 45% of global population" },
      { icon: "IconCreditCard", title: "Embedded Finance", description: "Non-financial apps integrating payments" },
      { icon: "IconLink", title: "Blockchain Infrastructure", description: "Reducing settlement times to near-zero" },
    ];
    features.layout = "list";

    return [
      {
        id: nanoid(),
        blocks: [headerBlock],
      },
      {
        id: nanoid(),
        blocks: [createTypedBlock(BLOCK_TYPES.PULSE_METRIC, metric)],
      },
      {
        id: nanoid(),
        blocks: [createTypedBlock(BLOCK_TYPES.FEATURE_LIST, features)],
      },
    ];
  },
};
