import { nanoid } from "nanoid";
import type { Row } from "@/types/presentation";
import { BLOCK_TYPES, createFAQContent } from "../blocks/definitions";
import type { Block } from "@/types/presentation";

export const FAQLayout = {
  id: "faq-layout",
  name: "FAQ Section",
  description: "Answer common questions with expandable sections",
  icon: "❓",
  getRows: (): Row[] => {
    // Row 1: Section Title
    const headerBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content:
        '<h2 style="text-align: center">Frequently Asked Questions</h2>\n\n<p style="text-align: center">Everything you need to know about security, deployment, and billing.</p>',
    };

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
        blocks: [{ id: nanoid(), type: BLOCK_TYPES.FAQ, content: faq }],
      },
    ];
  },
};
