import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import type { LayoutTemplate } from "../layoutTemplates";
import { BLOCK_TYPES, createPricingCardContent } from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";
import { createParagraphContent } from "../blocks/definitions/common";

export const PricingThreeTierLayout: LayoutTemplate = {
  id: "pricing-three-tier-layout",
  name: "Pricing - 3 Tier",
  description: "Three-tier pricing table with a highlighted plan",
  icon: "💲",
  getRows: (): Row[] => {
    const header: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: '<h2 style="text-align: center">Transparent Pricing. Scales With You.</h2>\n\n<p style="text-align: center">Start small and upgrade as you grow. No hidden fees, cancel anytime.</p>',
    };

    const plans = [
        {
            name: "Starter",
            price: "$0",
            features: [
                { text: "Up to 3 team members", included: true },
                { text: "Basic analytics", included: true },
                { text: "Community support", included: true },
                { text: "Advanced security", included: false },
                { text: "Dedicated account manager", included: false },
            ],
            btn: "Get Started Free"
        },
        {
            name: "Pro",
            price: "$49/mo",
            features: [
                { text: "Up to 20 team members", included: true },
                { text: "Advanced analytics & reporting", included: true },
                { text: "Priority email support", included: true },
                { text: "SSO & Audit logs", included: true },
                { text: "Dedicated account manager", included: false },
            ],
            btn: "Start Free Trial"
        },
        {
            name: "Enterprise",
            price: "Custom",
            features: [
                { text: "Unlimited team members", included: true },
                { text: "Custom data warehousing", included: true },
                { text: "24/7 Phone support", included: true },
                { text: "Advanced security & compliance", included: true },
                { text: "Dedicated account manager", included: true },
            ],
            btn: "Contact Sales"
        }
    ].map((tier) => {
      const plan = createPricingCardContent();
      plan.planName = createParagraphContent(tier.name);
      plan.price = createParagraphContent(tier.price);
      plan.features = tier.features.map(f => ({
          text: createParagraphContent(f.text),
          included: f.included
      }));
      plan.buttonLabel = tier.btn;
      return plan;
    });

    return [
      {
        id: nanoid(),
        blocks: [header],
      },
      {
        id: nanoid(),
        blocks: plans.map((plan) => ({
          id: nanoid(),
          type: BLOCK_TYPES.PRICING_CARD,
          content: plan,
        })),
        columnWidths: [1, 1, 1],
      },
    ];
  },
};
