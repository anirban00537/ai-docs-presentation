import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import {
  BLOCK_TYPES,
  createPricingCardContent,
} from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";
import { getDefaultHeadingContent, createParagraphContent } from "../blocks/definitions/common";

const createTextDoc = (text: string) => ({
    type: "doc" as const,
    content: [{ type: "paragraph", content: [{ type: "text", text }] }],
});
const createHeadingDoc = (text: string, level = 3) => ({
    type: "doc" as const,
    content: [{ type: "heading", attrs: { level }, content: [{ type: "text", text }] }],
});

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
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2, textAlign: "center" },
            content: [{ type: "text", text: "Simple, Transparent Pricing" }],
          },
          {
            type: "paragraph",
            attrs: { textAlign: "center" },
            content: [
              {
                type: "text",
                text: "Choose the plan that's right for you.",
              },
            ],
          },
        ],
      },
    };

    // Row 2: Three Pricing Cards
    const plan1 = createPricingCardContent();
    plan1.planName = createHeadingDoc("Starter");
    plan1.price = createHeadingDoc("$0/mo");
    plan1.buttonLabel = "Start Free";
    plan1.features = [
        { text: createTextDoc("Basic Features"), included: true },
        { text: createTextDoc("1 User"), included: true },
        { text: createTextDoc("Community Support"), included: true },
        { text: createTextDoc("Advanced Analytics"), included: false },
    ];

    const plan2 = createPricingCardContent();
    plan2.planName = createHeadingDoc("Pro");
    plan2.price = createHeadingDoc("$29/mo");
    plan2.buttonLabel = "Get Pro";
    plan2.isRecommended = true;
    plan2.features = [
        { text: createTextDoc("All Basic Features"), included: true },
        { text: createTextDoc("5 Users"), included: true },
        { text: createTextDoc("Priority Support"), included: true },
        { text: createTextDoc("Advanced Analytics"), included: true },
    ];

    const plan3 = createPricingCardContent();
    plan3.planName = createHeadingDoc("Enterprise");
    plan3.price = createHeadingDoc("Custom");
    plan3.buttonLabel = "Contact Us";
    plan3.features = [
        { text: createTextDoc("Unlimited Users"), included: true },
        { text: createTextDoc("Dedicated Account Manager"), included: true },
        { text: createTextDoc("Custom Integrations"), included: true },
        { text: createTextDoc("SLA"), included: true },
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
