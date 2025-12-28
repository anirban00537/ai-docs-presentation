/**
 * Founder Story Layout Template
 * Founder/executive profile with portrait accent image.
 * 
 * @example
 * Used for: About us, Origin stories, Investor decks, Speaker intros
 */

import { nanoid } from "nanoid";
import type { Row, LayoutTemplate, Block } from "@/types/presentation";
import { BLOCK_TYPES, createTestimonialContent, createTimelineContent } from "../blocks/definitions";
import { createTypedBlock } from "./template-utils";

export const FounderStoryLayout: LayoutTemplate = {
  id: "founder-story-layout",
  name: "Founder Story",
  description: "Executive or founder bio with milestone timeline and quote. Features left-side accent with professional portrait.",
  icon: "IconUser",
  accent: {
    position: "left",
    size: 45,
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800", // Professional portrait
  },
  getRows: (): Row[] => {
    // Powerful Quote
    const testimonial = createTestimonialContent();
    testimonial.quote = "We didn't just want to build software; we wanted to change how the world collaborates. Every line of code writes our future.";
    testimonial.name = "Elena Rodriguez";
    testimonial.role = "Founder & CEO, NexusStream";
    testimonial.avatar = ""; // Use accent for image

    // Prose Introduction
    const bioBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "### A Visionary Leader\n\nWith over 15 years in Silicon Valley, Elena has led engineering teams at Google and Amazon. She founded NexusStream to solve the fragmentation of remote work tools.",
    };

    // Milestone Timeline
    const timeline = createTimelineContent();
    timeline.steps = [
      { icon: "IconLamp", title: "2019", description: "Founded in Garage" },
      { icon: "IconRocket", title: "2021", description: "Series A ($15M)" },
      { icon: "IconWorld", title: "2023", description: "Global Expansion" },
      { icon: "IconTrophy", title: "2025", description: "Market Leader" },
    ];

    return [
      {
        id: nanoid(),
        blocks: [createTypedBlock(BLOCK_TYPES.TESTIMONIAL, testimonial)],
      },
      {
        id: nanoid(),
        blocks: [bioBlock],
      },
      {
        id: nanoid(),
        blocks: [createTypedBlock(BLOCK_TYPES.TIMELINE, timeline)],
      },
    ];
  },
};
