import { nanoid } from "nanoid";
import type { Row } from "@/types/presentation";
import {
  BLOCK_TYPES,
  createTestimonialContent,
} from "../block/blocks/definitions";
import type { Block } from "@/types/presentation";

export const TestimonialLayout = {
  id: "testimonial-layout",
  name: "Customer Stories",
  description: "Share the love from your community",
  icon: "💬",
  getRows: (): Row[] => {
    // Row 1: Section Title
    const headerBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content:
        '<h2 style="text-align: center">Loved by Developers</h2>\n\n<p style="text-align: center">See why 10,000+ teams switched to a better workflow.</p>',
    };

    // Row 2: Three Testimonials
    const testimonial1 = createTestimonialContent();
    testimonial1.quote =
      "The best developer experience I've ever seen. It just works.";
    testimonial1.name = "Alex Rivera";
    testimonial1.role = "Senior Engineer, Stripe";

    const testimonial2 = createTestimonialContent();
    testimonial2.quote =
      "Saved us months of development time. The ROI is immediate.";
    testimonial2.name = "Samantha Chen";
    testimonial2.role = "CTO, Vercel";

    const testimonial3 = createTestimonialContent();
    testimonial3.quote =
      "Documentation is incredible, and the support is even better.";
    testimonial3.name = "Jordan Smith";
    testimonial3.role = "Staff Engineer, Linear";

    return [
      {
        id: nanoid(),
        blocks: [headerBlock],
      },
      {
        id: nanoid(),
        blocks: [
          {
            id: nanoid(),
            type: BLOCK_TYPES.TESTIMONIAL,
            content: testimonial1,
          },
          {
            id: nanoid(),
            type: BLOCK_TYPES.TESTIMONIAL,
            content: testimonial2,
          },
          {
            id: nanoid(),
            type: BLOCK_TYPES.TESTIMONIAL,
            content: testimonial3,
          },
        ],
      },
    ];
  },
};
