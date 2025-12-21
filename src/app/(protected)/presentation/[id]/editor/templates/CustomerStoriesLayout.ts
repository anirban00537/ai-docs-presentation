import { nanoid } from "nanoid";
import type { Row } from "@/types/presentation";
import {
  BLOCK_TYPES,
  createTimelineContent,
  createTestimonialContent,
} from "../blocks/definitions";
import type { Block } from "@/types/presentation";

export const CustomerStoriesLayout = {
  id: "customer-stories-layout",
  name: "Customer Stories",
  description: "Narrative of customer success with proof points",
  icon: "📚",
  getRows: (): Row[] => {
    const header: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "<h2 style=\"text-align: center\">Case Study: Scaling Global Operations</h2>\n\n<p style=\"text-align: center\">How Acme Corp reduced overhead by 30% while expanding into 5 new markets.</p>",
    };

    const timeline = createTimelineContent();
    timeline.title = undefined;
    timeline.steps = [
      {
        title: "The Challenge",
        description: "Acme Corp faced fragmented data across 12 regions, leading to a 2-week delay in monthly reporting and strategic blind spots.",
        icon: "🔥",
      },
      {
        title: "The Solution",
        description: "They unified their data pipeline using our Enterprise Connect platform, creating a single source of truth for all regional KPIs.",
        icon: "💡",
      },
      {
        title: "Implementation",
        description: "Deployed in just 6 weeks with zero downtime. 500+ users onboarded with role-based access control.",
        icon: "🚀",
      },
      {
        title: "The Outcome",
        description: "Real-time visibility into global ops. 30% OpEx reduction and 4x faster decision-making cycles.",
        icon: "📈",
      },
    ];

    const testimonial = createTestimonialContent();
    testimonial.quote = "“This transformation wasn't just about software; it was about giving our leaders the confidence to move fast. best investment we made this year.”";
    testimonial.name = "Elena K.";
    testimonial.role = "Global VP of Operations, Acme Corp";
    testimonial.avatar = "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=faces";

    return [
      {
        id: nanoid(),
        blocks: [header],
      },
      {
        id: nanoid(),
        blocks: [
          { id: nanoid(), type: BLOCK_TYPES.TIMELINE, content: timeline },
        ],
      },
      {
        id: nanoid(),
        blocks: [
          { id: nanoid(), type: BLOCK_TYPES.TESTIMONIAL, content: testimonial },
        ],
      },
    ];
  },
};
