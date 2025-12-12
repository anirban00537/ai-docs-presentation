import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import { BLOCK_TYPES, createFAQContent } from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";

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
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2, textAlign: "center" },
            content: [{ type: "text", text: "Frequently Asked Questions" }],
          },
          {
            type: "paragraph",
            attrs: { textAlign: "center" },
            content: [
              {
                type: "text",
                text: "Everything you need to know",
              },
            ],
          },
        ],
      },
    };

    // Row 2: FAQ Block
    const faq = createFAQContent();
    faq.items = [
      {
        question: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "How does it work?",
                },
              ],
            },
          ],
        },
        answer: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "It's simple and straightforward. Just sign up, choose your plan, and start creating. Our intuitive interface makes it easy for anyone to get started.",
                },
              ],
            },
          ],
        },
        expanded: false,
      },
      {
        question: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "What are the pricing plans?",
                },
              ],
            },
          ],
        },
        answer: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "We offer flexible pricing plans to suit your needs. Check our pricing page for detailed information about each plan and what's included.",
                },
              ],
            },
          ],
        },
        expanded: false,
      },
      {
        question: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Can I cancel anytime?",
                },
              ],
            },
          ],
        },
        answer: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Yes, absolutely! You can cancel your subscription at any time. There are no long-term contracts or cancellation fees.",
                },
              ],
            },
          ],
        },
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
