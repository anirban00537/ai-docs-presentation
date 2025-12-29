import { BLOCK_TYPES } from "@/types/presentation";
import {
  IconFileText,
  IconPhoto,
  IconCode,
  IconSeparator,
  IconHash,
  IconNumber,
} from "@tabler/icons-react";

export const getBlockTypeIcon = (type: string) => {
  switch (type) {
    case BLOCK_TYPES.PROSEMIRROR:
      return <IconFileText size={16} />;
    case BLOCK_TYPES.IMAGE:
      return <IconPhoto size={16} />;
    case BLOCK_TYPES.CODE:
      return <IconCode size={16} />;
    case BLOCK_TYPES.SPACER:
      return <IconSeparator size={16} />;
    case BLOCK_TYPES.NUMBER_CARD:
      return <IconHash size={16} />;
    case BLOCK_TYPES.SIMPLE_NUMBER_CARD:
      return <IconNumber size={16} />;
    default:
      return <IconFileText size={16} />;
  }
};

export const getBlockTypeLabel = (type: string) => {
  switch (type) {
    case BLOCK_TYPES.PROSEMIRROR:
      return "Text Block";
    case BLOCK_TYPES.IMAGE:
      return "Image";
    case BLOCK_TYPES.CODE:
      return "Code";
    case BLOCK_TYPES.SPACER:
      return "Spacer";
    case BLOCK_TYPES.NUMBER_CARD:
      return "Number Card";
    case BLOCK_TYPES.SIMPLE_NUMBER_CARD:
      return "Simple Number";
    default:
      return type;
  }
};

