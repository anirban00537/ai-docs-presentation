/**
 * Stats Layout Template
 * Showcase key metrics with animated counters.
 * 
 * @example
 * Used for: Performance reports, Impact showcases, KPI displays
 */

import { nanoid } from "nanoid";
import type { Row, LayoutTemplate } from "@/types/presentation";
import { BLOCK_TYPES, createStatsCounterContent } from "../blocks/definitions";
import { createProseMirrorBlock, createSectionHeader, createTypedBlock } from "./template-utils";

export const StatsLayout: LayoutTemplate = {
  id: "stats-layout",
  name: "Statistics Dashboard",
  description: "Key metrics display with animated stat counters. Perfect for performance reports, impact showcases, and KPI displays.",
  icon: "IconChartPie",
  getRows: (): Row[] => {
    // Row 1: Section Title
    const headerBlock = createProseMirrorBlock(
      createSectionHeader(
        "By The Numbers",
        "Scale, speed, and reliability you can trust."
      )
    );

    // Row 2: Stats Counter
    const stats = createStatsCounterContent();
    stats.stats = [
      {
        value: 50000,
        label: "Requests / Sec",
        icon: "IconZap",
        suffix: "+",
      },
      {
        value: 35,
        label: "Global Regions",
        icon: "IconWorld",
        suffix: "",
      },
      {
        value: 99,
        label: "Uptime Guarantee",
        icon: "IconShieldCheck",
        suffix: ".99%",
      },
    ];
    stats.layout = "horizontal";
    stats.columns = 3;

    return [
      {
        id: nanoid(),
        blocks: [headerBlock],
      },
      {
        id: nanoid(),
        blocks: [createTypedBlock(BLOCK_TYPES.STATS_COUNTER, stats)],
      },
    ];
  },
};
