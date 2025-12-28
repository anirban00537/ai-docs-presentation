/**
 * FAQ Layout Template
 * Answer common questions with expandable accordion sections.
 * 
 * @example
 * Used for: Support sections, Product FAQs, Help pages
 */

import { nanoid } from "nanoid";
import type { Row, LayoutTemplate } from "@/types/presentation";
import { BLOCK_TYPES, createFAQContent } from "../blocks/definitions";
import { createProseMirrorBlock, createSectionHeader, createTypedBlock } from "./template-utils";

export const FAQLayout: LayoutTemplate = {
  id: "faq-layout",
  name: "FAQ Section",
  description: "Expandable accordion-style FAQ section covering security, deployment, and billing. Great for support pages and pre-sales objection handling.",
  icon: "IconQuestionMark",
  getRows: (): Row[] => {
    // Row 1: Section Title
    const headerBlock = createProseMirrorBlock(
      createSectionHeader(
        "Frequently Asked Questions",
        "Everything you need to know about security, deployment, and billing."
      )
    );

    // Row 2: FAQ Block
    const faq = createFAQContent();
    faq.items = [
      {
        question: "How secure is the platform?",
        answer:
          "We are SOC2 Type II, ISO 27001, and GDPR compliant. All data is encrypted at rest and in transit.",
        expanded: false,
      },
      {
        question: "Can we self-host?",
        answer:
          "Yes! We offer on-premise deployment via Docker or Kubernetes for our Enterprise customers.",
        expanded: false,
      },
      {
        question: "What kind of support is included?",
        answer:
          "All plans include community support. Pro plans get email priority, and Enterprise gets 24/7 dedicated phone support.",
        expanded: false,
      },
      {
        question: "Do you offer a free trial?",
        answer:
          "Yes, you can try our Pro plan free for 14 days. No credit card required.",
        expanded: false,
      },
    ];
    faq.style = "accordion";

    return [
      {
        id: nanoid(),
        blocks: [headerBlock],
      },
      {
        id: nanoid(),
        blocks: [createTypedBlock(BLOCK_TYPES.FAQ, faq)],
      },
    ];
  },
};
