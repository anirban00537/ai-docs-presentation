/**
 * Metric Dashboard Layout Template
 * High-level KPI overview with pulse charts and insights.
 * 
 * @example
 * Used for: Executive reports, Performance reviews, Quarterly updates
 */

import { nanoid } from "nanoid";
import type { Row, LayoutTemplate } from "@/types/presentation";
import {
  BLOCK_TYPES,
  createPulseMetricContent,
  createGlassInsightContent,
} from "../blocks/definitions";
import { createProseMirrorBlock, createSectionHeader, createTypedBlock } from "./template-utils";

export const MetricDashboardLayout: LayoutTemplate = {
  id: "metric-dashboard",
  name: "Growth Metrics Dashboard",
  description: "Executive KPI dashboard with pulse charts and glass insight cards. Ideal for quarterly reports and performance reviews.",
  icon: "IconChartBar",
  getRows: (): Row[] => {
    // Row 1: Header
    const headerBlock = createProseMirrorBlock(
      createSectionHeader("Q3 Performance Overview")
    );

    return [
      {
        id: nanoid(),
        blocks: [headerBlock],
      },
      {
        id: nanoid(),
        blocks: [
          createTypedBlock(
            BLOCK_TYPES.PULSE_METRIC,
            createPulseMetricContent("+127%", "Revenue Growth")
          ),
          createTypedBlock(
            BLOCK_TYPES.PULSE_METRIC,
            createPulseMetricContent("+84k", "New Active Users")
          ),
          createTypedBlock(
            BLOCK_TYPES.PULSE_METRIC,
            createPulseMetricContent("-12%", "Churn Rate")
          ),
        ],
      },
      {
        id: nanoid(),
        blocks: [
          createTypedBlock(
            BLOCK_TYPES.GLASS_INSIGHT,
            createGlassInsightContent(
              "IconRocket",
              "Our growth velocity has accelerated significantly this quarter, driven largely by the new enterprise tier adoption."
            )
          ),
          createTypedBlock(
            BLOCK_TYPES.GLASS_INSIGHT,
            createGlassInsightContent(
              "IconTrendingDown",
              "Churn reduction initiatives are working. We've seen a 12% drop in cancellations after implementing the new onboarding flow."
            )
          ),
        ],
      },
    ];
  },
};
