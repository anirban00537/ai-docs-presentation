/**
 * Testimonial Layout Template
 * Customer testimonials and reviews display.
 * 
 * @example
 * Used for: Customer stories, Case studies, Social proof sections
 */

import { nanoid } from "nanoid";
import type { Row, LayoutTemplate } from "@/types/presentation";
import { BLOCK_TYPES, createTestimonialContent } from "../blocks/definitions";
import { createProseMirrorBlock, createSectionHeader, createTypedBlock } from "./template-utils";

export const TestimonialLayout: LayoutTemplate = {
  id: "testimonial-layout",
  name: "Testimonials",
  description: "Customer testimonials and reviews",
  icon: "IconMessageChat",
  getRows: (): Row[] => {
    // Row 1: Section Title
    const headerBlock = createProseMirrorBlock(
      createSectionHeader(
        "What Our Customers Say",
        "Join thousands of satisfied customers worldwide."
      )
    );

    // Row 2: Testimonial Cards
    const testimonial1 = createTestimonialContent();
    testimonial1.quote =
      "This platform has completely transformed how we work. The efficiency gains are remarkable.";
    testimonial1.name = "Sarah Chen";
    testimonial1.role = "VP of Engineering, TechCorp";

    const testimonial2 = createTestimonialContent();
    testimonial2.quote =
      "The best investment we've made this year. ROI was visible within the first month.";
    testimonial2.name = "Michael Torres";
    testimonial2.role = "CEO, StartupXYZ";

    const testimonial3 = createTestimonialContent();
    testimonial3.quote =
      "Support team is incredible. They helped us migrate in record time with zero downtime.";
    testimonial3.name = "Emily Johnson";
    testimonial3.role = "CTO, Enterprise Inc";

    return [
      {
        id: nanoid(),
        blocks: [headerBlock],
      },
      {
        id: nanoid(),
        blocks: [
          createTypedBlock(BLOCK_TYPES.TESTIMONIAL, testimonial1),
          createTypedBlock(BLOCK_TYPES.TESTIMONIAL, testimonial2),
          createTypedBlock(BLOCK_TYPES.TESTIMONIAL, testimonial3),
        ],
      },
    ];
  },
};
