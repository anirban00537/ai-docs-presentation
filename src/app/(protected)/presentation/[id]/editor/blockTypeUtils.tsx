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
    case "number-card":
      return <IconHash size={16} />;
    case "testimonial":
      return <IconMessageCircle size={16} />;
    case "cta":
      return <IconTarget size={16} />;
    case "quote":
      return <IconQuote size={16} />;
    case "timeline":
      return <IconTimeline size={16} />;
    default:
      return <IconFileText size={16} />;
  }
};

export const getBlockTypeLabel = (type: string) => {
  switch (type) {
    case "number-card":
      return "Number Card";
    case "testimonial":
      return "Testimonial";
    case "cta":
      return "CTA Banner";
    case "quote":
      return "Quote";
    case "timeline":
      return "Timeline";
    case "prosemirror":
      return "Text Block";
    default:
      return type;
  }
};
