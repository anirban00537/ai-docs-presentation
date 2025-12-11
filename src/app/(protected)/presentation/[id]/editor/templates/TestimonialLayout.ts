import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import {
  BLOCK_TYPES,
  createTestimonialContent,
} from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";

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
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2, textAlign: "center" },
            content: [{ type: "text", text: "Trusted by Leaders" }],
          },
          {
            type: "paragraph",
            attrs: { textAlign: "center" },
            content: [
              {
                type: "text",
                text: "Don't just take our word for it. Here is what our customers are saying.",
              },
            ],
          },
        ],
      },
    };

    // Row 2: Three Testimonials
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

