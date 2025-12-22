/**
 * Founder Story Layout Template
 * Founder/executive profile with portrait accent image.
 * 
 * @example
 * Used for: About us, Origin stories, Investor decks, Speaker intros
 */

import { nanoid } from "nanoid";
import type { Row, LayoutTemplate } from "@/types/presentation";
import { BLOCK_TYPES, createTestimonialContent } from "../blocks/definitions";
import { createTypedBlock } from "./template-utils";

export const FounderStoryLayout: LayoutTemplate = {
  id: "founder-story-layout",
  name: "Founder Story",
  description: "Executive profile with portrait accent",
  icon: "👤",
  accent: {
    position: "left",
    size: 40,
    url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800",
  },
  getRows: (): Row[] => {
    // Quote/Story
    const testimonial = createTestimonialContent();
    testimonial.quote = "We started with a simple mission: make work feel less like work. From a garage in Palo Alto to serving millions of users worldwide, our journey has been about believing in the impossible.";
    testimonial.name = "Alex Chen";
    testimonial.role = "Founder & CEO";

    // Additional context using markdown format
    const contextBlock = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "### The Journey\n\n**2018:** Founded in a garage\n\n**2020:** Series A, $12M raised\n\n**2022:** 1M+ active users\n\n**2024:** $100M ARR milestone",
    };

    return [
      {
        id: nanoid(),
        blocks: [createTypedBlock(BLOCK_TYPES.TESTIMONIAL, testimonial)],
      },
      {
        id: nanoid(),
        blocks: [contextBlock],
      },
    ];
  },
};
