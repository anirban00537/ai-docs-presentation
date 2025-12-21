import { Row, Block } from "@/types/presentation";
import type { LayoutTemplate } from "../layoutTemplates";
import {
  BLOCK_TYPES,
  createPulseMetricContent,
  createGlassInsightContent,
} from "../blocks/definitions";
import { nanoid } from "@reduxjs/toolkit";

export const MetricDashboardLayout: LayoutTemplate = {
  id: "metric-dashboard",
  name: "Growth Metrics Dashboard",
  description: "High-level KPI overview with pulse charts",
  icon: "ChartBar",
  getRows: (): Row[] => [
    {
      id: nanoid(),
      blocks: [
        {
          id: nanoid(),
          type: BLOCK_TYPES.PROSEMIRROR,
          content: "<p style=\"text-align: center\">Q3 Performance Overview</p>",
        } as Block,
      ],
    },
    {
      id: nanoid(),
      blocks: [
        {
          id: nanoid(),
          type: BLOCK_TYPES.PULSE_METRIC,
          content: createPulseMetricContent("+127%", "Revenue Growth"),
        } as Block,
        {
          id: nanoid(),
          type: BLOCK_TYPES.PULSE_METRIC,
          content: createPulseMetricContent("+84k", "New Active Users"),
        } as Block,
        {
          id: nanoid(),
          type: BLOCK_TYPES.PULSE_METRIC,
          content: createPulseMetricContent("-12%", "Churn Rate"),
        } as Block,
      ],
    },
    {
      id: nanoid(),
      blocks: [
        {
          id: nanoid(),
          type: BLOCK_TYPES.GLASS_INSIGHT,
          content: createGlassInsightContent(
            "🚀",
            "Our growth velocity has accelerated significantly this quarter, driven largely by the new enterprise tier adoption."
          ),
        } as Block,
        {
          id: nanoid(),
          type: BLOCK_TYPES.GLASS_INSIGHT,
          content: createGlassInsightContent(
            "📉",
            "Churn reduction initiatives are working. We've seen a 12% drop in cancellations after implementing the new onboarding flow."
          ),
        } as Block,
      ],
    },
  ],
};
