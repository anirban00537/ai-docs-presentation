/**
 * Contextual Testimonial Layout Template
 * Customer testimonial with contextual image.
 * 
 * @example
 * Used for: Social proof, Customer stories, Endorsements
 */

import { nanoid } from "nanoid";
import type { Row, LayoutTemplate, Block } from "@/types/presentation";
import { BLOCK_TYPES, createTestimonialContent, createLogoGridContent } from "../blocks/definitions";
import { createTypedBlock } from "./template-utils";

export const ContextualTestimonialLayout: LayoutTemplate = {
  id: "contextual-testimonial-layout",
  name: "Contextual Testimonial",
  description: "Customer quote with rating and trust signals. Features right-side accent image showing team collaboration.",
  icon: "IconMessageChat",
  accent: {
    position: "right",
    size: 45,
    url: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800", // Team collaborating/smiling
  },
  getRows: (): Row[] => {
    // Powerful Quote
    const testimonial = createTestimonialContent();
    testimonial.quote = "The ROI was immediate. We saved 20 hours per week per engineer, and our deployment frequency doubled. It's the tool we didn't know we needed until we had it.";
    testimonial.name = "Marcus Johnson";
    testimonial.role = "VP of Engineering, CloudScale";

    // Trust Signals - Rating & Source
    const ratingBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "5/5 Stars\n\n**\"Best Developer Tool 2024\"** — *TechReview Weekly*",
    };

    // Customer Logo validation
    const logos = createLogoGridContent();
    logos.logos = [
      { name: "CloudScale", image: "" },
      { name: "Forbes Tech Council", image: "" },
      { name: "G2 High Performer", image: "" },
    ];
    logos.columns = 3;

    return [
      {
        id: nanoid(),
        blocks: [createTypedBlock(BLOCK_TYPES.TESTIMONIAL, testimonial)],
      },
      {
        id: nanoid(),
        blocks: [ratingBlock],
      },
      {
        id: nanoid(),
        blocks: [createTypedBlock(BLOCK_TYPES.LOGO_GRID, logos)],
      },
    ];
  },
};
