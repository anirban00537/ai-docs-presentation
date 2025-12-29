import React from "react";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/slidesSlice";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BLOCK_TYPES,
  createCalloutContent
} from "../blocks/definitions";
import {
  IconFileText,
  IconPhoto,
  IconCode,
  IconSeparator,
  IconHash,
  IconNumber,
  IconLayoutSidebarLeftCollapse,
  IconBadge,
  IconContrast,
  IconBoxModel,
  IconLayersIntersect,
  IconPolygon,
  IconInfoCircle,
  IconAlertTriangle,
  IconAlertOctagon,
  IconNote,
  IconCircleNumber1,
  IconFolder,
  IconLayout,
} from "@tabler/icons-react";
import { BlockOption } from "../block/BlockOption";

interface BlockLibraryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BlockDefinition {
  type: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  initialContent?: Record<string, any>;
}

const blockDefinitions: BlockDefinition[] = [
  {
    type: BLOCK_TYPES.PROSEMIRROR,
    icon: <IconFileText size={18} />,
    label: "Text",
    description: "Rich text editor with formatting",
  },
  {
    type: BLOCK_TYPES.IMAGE,
    icon: <IconPhoto size={18} />,
    label: "Image",
    description: "Single image with caption",
  },
  {
    type: BLOCK_TYPES.CODE,
    icon: <IconCode size={18} />,
    label: "Code",
    description: "Syntax-highlighted code snippets",
  },
  {
    type: BLOCK_TYPES.SPACER,
    icon: <IconSeparator size={18} />,
    label: "Spacer",
    description: "Adjustable vertical space",
  },
  {
    type: BLOCK_TYPES.NUMBER_CARD,
    icon: <IconHash size={18} />,
    label: "Number Card",
    description: "Sequence number and description",
  },
  {
    type: BLOCK_TYPES.SIMPLE_NUMBER_CARD,
    icon: <IconNumber size={18} />,
    label: "Simple Number",
    description: "Minimalist number with text",
  },
  {
    type: BLOCK_TYPES.SPINE_CARD,
    icon: <IconLayoutSidebarLeftCollapse size={18} />,
    label: "Spine Card",
    description: "Vertical accent for emphasis",
  },
  {
    type: BLOCK_TYPES.MODERN_PILL_CARD,
    icon: <IconBadge size={18} />,
    label: "Pill Card",
    description: "Categorized header with pill",
  },
  {
    type: BLOCK_TYPES.INVERTED_IMPACT_BLOCK,
    icon: <IconContrast size={18} />,
    label: "Inverted",
    description: "High contrast impact block",
  },
  {
    type: BLOCK_TYPES.GLASS_BILLBOARD_BLOCK,
    icon: <IconBoxModel size={18} />,
    label: "Billboard",
    description: "Centered hero text",
  },
  {
    type: BLOCK_TYPES.LAYERED_NUMBER_BLOCK,
    icon: <IconLayersIntersect size={18} />,
    label: "Layered",
    description: "Depth with large number",
  },
  {
    type: BLOCK_TYPES.CORNER_CUT_BLOCK,
    icon: <IconPolygon size={18} />,
    label: "Corner Cut",
    description: "Geometric edge accent",
  },
  {
    type: BLOCK_TYPES.STEP_CARD_BLOCK,
    icon: <IconCircleNumber1 size={18} />,
    label: "Step Card",
    description: "Numbered process step",
  },
  {
    type: BLOCK_TYPES.CALLOUT_BLOCK,
    icon: <IconNote size={18} />,
    label: "Note box",
    description: "Neutral note box",
    initialContent: createCalloutContent("note"),
  },
  {
    type: BLOCK_TYPES.CALLOUT_BLOCK,
    icon: <IconInfoCircle size={18} />,
    label: "Info box",
    description: "Blue info callout",
    initialContent: createCalloutContent("info"),
  },
  {
    type: BLOCK_TYPES.CALLOUT_BLOCK,
    icon: <IconAlertTriangle size={18} />,
    label: "Warning box",
    description: "Yellow warning alert",
    initialContent: createCalloutContent("warning"),
  },
  {
    type: BLOCK_TYPES.CALLOUT_BLOCK,
    icon: <IconAlertOctagon size={18} />,
    label: "Error box",
    description: "Red error/caution",
    initialContent: createCalloutContent("error"),
  },
  {
    type: BLOCK_TYPES.DOG_EAR_ICON_BLOCK,
    icon: <IconFileText size={18} />,
    label: "Memo",
    description: "Icon file card",
  },
  {
    type: BLOCK_TYPES.SPLIT_HEADER_ICON_BLOCK,
    icon: <IconFolder size={18} />,
    label: "Group",
    description: "Folder with header",
  },
  {
    type: BLOCK_TYPES.OUTLINE_OFFSET_ICON_BLOCK,
    icon: <IconLayout size={18} />,
    label: "Blueprint",
    description: "Technical spec card",
  },
];


export const BlockLibraryPanel: React.FC<BlockLibraryPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const isDark = theme.themeType === "dark";

  const panelVariants = {
    hidden: {
      opacity: 0,
      x: 20,
      scale: 0.98,
      transition: { duration: 0.15 },
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { duration: 0.2 },
    },
    exit: {
      opacity: 0,
      x: 20,
      scale: 0.98,
      transition: { duration: 0.15 },
    },
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="blocks-panel"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={panelVariants}
          className="relative z-40"
        >
          <div
            className="relative w-[380px] max-h-[75vh] flex flex-col rounded-2xl overflow-hidden"
            style={{
              backgroundColor: isDark
                ? "rgba(30, 30, 40, 0.5)"
                : "rgba(255, 255, 255, 0.5)",
              backdropFilter: "blur(32px) saturate(200%)",
              WebkitBackdropFilter: "blur(32px) saturate(200%)",
              boxShadow: isDark
                ? `
                  0 1px 0 0 rgba(255, 255, 255, 0.1) inset,
                  0 -1px 0 0 rgba(0, 0, 0, 0.2) inset,
                  0 8px 40px rgba(0, 0, 0, 0.4),
                  0 2px 8px rgba(0, 0, 0, 0.2)
                `
                : `
                  0 1px 0 0 rgba(255, 255, 255, 0.9) inset,
                  0 -1px 0 0 rgba(0, 0, 0, 0.05) inset,
                  0 8px 40px rgba(0, 0, 0, 0.08),
                  0 2px 8px rgba(0, 0, 0, 0.04)
                `,
            }}
          >
            {/* Glass shine overlay */}
            <div
              className="absolute inset-0 pointer-events-none rounded-2xl"
              style={{
                background: isDark
                  ? "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, transparent 40%, transparent 60%, rgba(255, 255, 255, 0.02) 100%)"
                  : "linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, transparent 40%, transparent 60%, rgba(255, 255, 255, 0.3) 100%)",
              }}
            />

            {/* Header */}
            <div className="relative px-4 py-3 flex items-center justify-between shrink-0">
              <span
                className="text-sm font-medium"
                style={{ color: isDark ? "#fff" : "#000" }}
              >
                Add Block
              </span>
              <button
                className="p-1.5 rounded-lg transition-all opacity-50 hover:opacity-100"
                onClick={onClose}
                style={{ color: isDark ? "#fff" : "#000" }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Blocks Grid */}
            <div
              className={`relative flex-1 overflow-y-auto px-3 pb-3 ${isDark ? "custom-scrollbar-dark" : "custom-scrollbar-light"
                }`}
            >
              <p
                className="text-[11px] font-medium mb-2 px-1 opacity-50"
                style={{ color: isDark ? "#fff" : "#000" }}
              >
                Drag to add to your slide
              </p>
              <div className="grid grid-cols-4 gap-1">
                {blockDefinitions.map((block, index) => (
                  <BlockOption
                    key={`${block.type}-${index}`}
                    id={`block-option-${block.type}-${index}`}
                    blockType={block.type}
                    icon={block.icon}
                    label={block.label}
                    initialContent={block.initialContent}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
