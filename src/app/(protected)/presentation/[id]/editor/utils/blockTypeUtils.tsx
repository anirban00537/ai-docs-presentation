import { BLOCK_TYPES } from "@/types/presentation";
import {
  IconFileText,
  IconHash,
  IconMessageCircle,
  IconTarget,
  IconQuote,
  IconTimeline,
} from "@tabler/icons-react";

export const getBlockTypeIcon = (type: string) => {
  switch (type) {
    case BLOCK_TYPES.NUMBER_CARD:
      return <IconHash size={16} />;
    case BLOCK_TYPES.TESTIMONIAL:
      return <IconMessageCircle size={16} />;
    case BLOCK_TYPES.CTA:
      return <IconTarget size={16} />;
    case BLOCK_TYPES.QUOTE:
      return <IconQuote size={16} />;
    case BLOCK_TYPES.TIMELINE:
      return <IconTimeline size={16} />;
    default:
      return <IconFileText size={16} />;
  }
};

export const getBlockTypeLabel = (type: string) => {
  switch (type) {
    case BLOCK_TYPES.NUMBER_CARD:
      return "Number Card";
    case BLOCK_TYPES.TESTIMONIAL:
      return "Testimonial";
    case BLOCK_TYPES.CTA:
      return "CTA Banner";
    case BLOCK_TYPES.QUOTE:
      return "Quote";
    case BLOCK_TYPES.TIMELINE:
      return "Timeline";
    case BLOCK_TYPES.PROSEMIRROR:
      return "Text Block";
    default:
      return type;
  }
};
