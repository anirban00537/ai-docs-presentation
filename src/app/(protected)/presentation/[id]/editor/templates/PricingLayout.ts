/**
 * Pricing Layout Template
 * Compare plans with clear features and pricing.
 * 
 * @example
 * Used for: Pricing pages, Plan comparisons, Subscription tiers
 */

import { nanoid } from "nanoid";
import type { Row, LayoutTemplate } from "@/types/presentation";
import { BLOCK_TYPES, createPricingCardContent } from "../blocks/definitions";
import { createProseMirrorBlock, createSectionHeader, createHeadingDoc, createTypedBlock } from "./template-utils";

export const PricingLayout: LayoutTemplate = {
  id: "pricing-layout",
  name: "Pricing Plans",
  description: "Compare plans with clear features",
  icon: "IconTag",
  getRows: (): Row[] => {
    // Row 1: Section Title
    const headerBlock = createProseMirrorBlock(
      createSectionHeader(
        "Simple, Transparent Pricing",
        "No hidden fees. Cancel anytime."
      )
    );

    // Row 2: Three Pricing Cards
    const plan1 = createPricingCardContent();
    plan1.planName = createHeadingDoc("Developer", 3);
    plan1.price = createHeadingDoc("$15/mo", 3);
    plan1.buttonLabel = "Start Building";
    plan1.features = [
      { text: "For personal projects", included: true },
      { text: "5k API Calls/mo", included: true },
      { text: "Community Support", included: true },
      { text: "SLA", included: false },
    ];

    const plan2 = createPricingCardContent();
    plan2.planName = createHeadingDoc("Startup", 3);
    plan2.price = createHeadingDoc("$99/mo", 3);
    plan2.buttonLabel = "Scale Up";
    plan2.features = [
      { text: "For growing teams", included: true },
      { text: "1M API Calls/mo", included: true },
      { text: "Email Support", included: true },
      { text: "99.9% SLA", included: true },
    ];

    const plan3 = createPricingCardContent();
    plan3.planName = createHeadingDoc("Business", 3);
    plan3.price = createHeadingDoc("$299/mo", 3);
    plan3.buttonLabel = "Contact Sales";
    plan3.features = [
      { text: "For high volume", included: true },
      { text: "Unlimited Calls", included: true },
      { text: "24/7 Phone Support", included: true },
      { text: "Dedicated Manager", included: true },
    ];

    return [
      {
        id: nanoid(),
        blocks: [headerBlock],
      },
      {
        id: nanoid(),
        blocks: [
          createTypedBlock(BLOCK_TYPES.PRICING_CARD, plan1),
          createTypedBlock(BLOCK_TYPES.PRICING_CARD, plan2),
          createTypedBlock(BLOCK_TYPES.PRICING_CARD, plan3),
        ],
      },
    ];
  },
};
