import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import {
  BLOCK_TYPES,
  createTestimonialContent,
} from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";

export const TestimonialLayout = {
  id: "testimonial-layout",
  name: "Testimonials",
  description: "Showcase customer testimonials and social proof",
  icon: "💬",
  getRows: (): Row[] => {
    // Row 1: Section Title
    const titleBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "What Our Customers Say" }],
          },
        ],
      },
    };

    // Row 2: First Testimonial
    const testimonial1 = createTestimonialContent();
    testimonial1.quote = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "This platform has completely transformed how our team collaborates. The productivity gains are remarkable.",
            },
          ],
        },
      ],
    };
    testimonial1.name = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Sarah Johnson" }],
        },
      ],
    };
    testimonial1.role = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "CEO, Tech Innovations" }],
        },
      ],
    };

    // Row 3: Second Testimonial
    const testimonial2 = createTestimonialContent();
    testimonial2.quote = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Best investment we've made this year. The features are exactly what we needed to scale our operations.",
            },
          ],
        },
      ],
    };
    testimonial2.name = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Michael Chen" }],
        },
      ],
    };
    testimonial2.role = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "VP of Engineering, StartupXYZ" }],
        },
      ],
    };

    // Row 4: Third Testimonial
    const testimonial3 = createTestimonialContent();
    testimonial3.quote = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "The support team is exceptional and the platform is incredibly intuitive. Highly recommended!",
            },
          ],
        },
      ],
    };
    testimonial3.name = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Emily Rodriguez" }],
        },
      ],
    };
    testimonial3.role = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Product Manager, Growth Labs" }],
        },
      ],
    };

    return [
      {
        id: nanoid(),
        blocks: [titleBlock],
      },
      {
        id: nanoid(),
        blocks: [
          {
            id: nanoid(),
            type: BLOCK_TYPES.TESTIMONIAL,
            content: testimonial1,
          },
        ],
      },
      {
        id: nanoid(),
        blocks: [
          {
            id: nanoid(),
            type: BLOCK_TYPES.TESTIMONIAL,
            content: testimonial2,
          },
        ],
      },
      {
        id: nanoid(),
        blocks: [
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

