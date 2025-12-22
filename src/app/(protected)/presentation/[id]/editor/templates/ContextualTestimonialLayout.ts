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
  description: "Testimonial with customer context visual",
  icon: "💬",
  accent: {
    position: "right",
    size: 45,
    url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
  },
  getRows: (): Row[] => {
    // Quote
    const testimonial = createTestimonialContent();
    testimonial.quote = "The best investment we've made this year. The platform has completely transformed how our team collaborates. ROI was visible within the first month.";
    testimonial.name = "Maria Garcia";
    testimonial.role = "VP of Sales, Acme Inc";

    // Rating - using markdown
    const ratingBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "⭐⭐⭐⭐⭐ *5.0 rating on G2*",
    };

    // Company logos
    const logos = createLogoGridContent();
    logos.logos = [
      { name: "Featured in Forbes", image: "" },
      { name: "TrustPilot Verified", image: "" },
      { name: "G2 Leader", image: "" },
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
