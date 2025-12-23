import { nanoid } from "nanoid";
import type { Row } from "@/types/presentation";
import { BLOCK_TYPES, createTestimonialContent } from "../blocks/definitions";
import type { Block } from "@/types/presentation";

export const CustomerQuotesLayout = {
  id: "customer-quotes-layout",
  name: "Customer Quotes",
  description: "Multiple quotes from customers for social proof",
  icon: "IconThumbUp",
  getRows: (): Row[] => {
    const header: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content:
        '<h2 style="text-align: center">Trusted by Industry Leaders</h2>\n\n<p style="text-align: center">Don\'t just take our word for it. Here\'s what the best in the business have to say about our impact.</p>',
    };

    const quotes = [
      createTestimonialContent(),
      createTestimonialContent(),
      createTestimonialContent(),
    ];
    quotes[0].quote =
      "“We deployed in under two weeks and saw an immediate 40% reduction in operational overhead. It's rare to find a tool that delivers on its promises so quickly.”";
    quotes[0].name = "Sarah Chen";
    quotes[0].role = "CTO, TechFlow";
    quotes[0].avatar =
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces";

    quotes[1].quote =
      "“The real-time collaboration features completely transformed how our distributed team works. We are faster, more aligned, and honestly, happier.”";
    quotes[1].name = "Marcus Rodriguez";
    quotes[1].role = "VP of Product, InnovateInc";
    quotes[1].avatar =
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=faces";

    quotes[2].quote =
      "“Before this, we were drowning in spreadsheets. Now, we have a clear, data-driven view of our entire pipeline. It's a game changer for our Q4 strategy.”";
    quotes[2].name = "Emily Thorne";
    quotes[2].role = "Director of Operations, Skyline";
    quotes[2].avatar =
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=faces";

    return [
      {
        id: nanoid(),
        blocks: [header],
      },
      {
        id: nanoid(),
        blocks: quotes.map((quote) => ({
          id: nanoid(),
          type: BLOCK_TYPES.TESTIMONIAL,
          content: quote,
        })),
        columnWidths: [1, 1, 1],
      },
    ];
  },
};
