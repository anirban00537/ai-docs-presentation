import { nanoid } from "nanoid";
import type { Row } from "@/types/presentation";
import { BLOCK_TYPES, createPricingCardContent } from "../blocks/definitions";
import type { Block } from "@/types/presentation";

const createHeadingDoc = (text: string, level = 3) => {
  const hashes = "#".repeat(level);
  return `${hashes} ${text}`;
};

export const PricingLayout = {
  id: "pricing-layout",
  name: "Pricing Plans",
  description: "Compare plans with clear features",
  icon: "🏷️",
  getRows: (): Row[] => {
    // Row 1: Section Title
    const headerBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content:
        '<h2 style="text-align: center">Simple, Transparent Pricing</h2>\n\n<p style="text-align: center">No hidden fees. Cancel anytime.</p>',
    };

    // Row 2: Three Pricing Cards
    const plan1 = createPricingCardContent();
    plan1.planName = createHeadingDoc("Developer");
    plan1.price = createHeadingDoc("$15/mo");
    plan1.buttonLabel = "Start Building";
    plan1.features = [
      { text: "For personal projects", included: true },
      { text: "5k API Calls/mo", included: true },
      { text: "Community Support", included: true },
      { text: "SLA", included: false },
    ];

    const plan2 = createPricingCardContent();
    plan2.planName = createHeadingDoc("Startup");
    plan2.price = createHeadingDoc("$99/mo");
    plan2.buttonLabel = "Scale Up";
    plan2.features = [
      { text: "For growing teams", included: true },
      { text: "1M API Calls/mo", included: true },
      { text: "Email Support", included: true },
      { text: "99.9% SLA", included: true },
    ];

    const plan3 = createPricingCardContent();
    plan3.planName = createHeadingDoc("Business");
    plan3.price = createHeadingDoc("$299/mo");
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
          { id: nanoid(), type: BLOCK_TYPES.PRICING_CARD, content: plan1 },
          { id: nanoid(), type: BLOCK_TYPES.PRICING_CARD, content: plan2 },
          { id: nanoid(), type: BLOCK_TYPES.PRICING_CARD, content: plan3 },
        ],
      },
    ];
  },
};
