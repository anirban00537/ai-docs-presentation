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
  description: "Market analysis with industry visual",
  icon: "🏭",
  accent: {
    position: "right",
    size: 40,
    url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800",
  },
  getRows: (): Row[] => {
    // Industry title - using markdown
    const headerBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "## Healthcare Industry\n\nTransforming patient care through digital innovation",
    };

    // Market metrics
    const metric = createPulseMetricContent("$4.2T", "Market Size");
    metric.trend = "up";

    // Key trends
    const features = createFeatureListContent();
    features.features = [
      { icon: "🤖", title: "AI Diagnostics", description: "70% faster detection" },
      { icon: "📱", title: "Telemedicine", description: "3x adoption since 2020" },
      { icon: "📊", title: "Digital Health", description: "$150B by 2025" },
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
