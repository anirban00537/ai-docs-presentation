import React from "react";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/slidesSlice";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BLOCK_TYPES,
  createCalloutContent,
  createButtonBlockContent,
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
  IconStar,
  IconHeading,
  IconH1,
  IconH2,
  IconH3,
  IconH4,
  IconQuote,
  IconClick,
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
  category: "Core" | "Callouts" | "Cards & Boxes" | "Interactive";
  initialContent?: any;
}

const blockDefinitions: BlockDefinition[] = [
  // Core
  {
    type: BLOCK_TYPES.PROSEMIRROR,
    icon: <IconHeading size={18} />,
    label: "Title",
    description: "Title of the slide",
    category: "Core",
    initialContent: "# Slide Title"
  },
  {
    type: BLOCK_TYPES.PROSEMIRROR,
    icon: <IconH1 size={18} />,
    label: "Heading 1",
    description: "Large section heading",
    category: "Core",
    initialContent: "# Heading 1"
  },
  {
    type: BLOCK_TYPES.PROSEMIRROR,
    icon: <IconH2 size={18} />,
    label: "Heading 2",
    description: "Medium section heading",
    category: "Core",
    initialContent: "## Heading 2"
  },
  {
    type: BLOCK_TYPES.PROSEMIRROR,
    icon: <IconH3 size={18} />,
    label: "Heading 3",
    description: "Small section heading",
    category: "Core",
    initialContent: "### Heading 3"
  },
  {
    type: BLOCK_TYPES.PROSEMIRROR,
    icon: <IconH4 size={18} />,
    label: "Heading 4",
    description: "Extra small section heading",
    category: "Core",
    initialContent: "#### Heading 4"
  },
  {
    type: BLOCK_TYPES.PROSEMIRROR,
    icon: <IconQuote size={18} />,
    label: "Quote",
    description: "Block quotation",
    category: "Core",
    initialContent: "> Your quote here"
  },
  {
    type: BLOCK_TYPES.IMAGE,
    icon: <IconPhoto size={18} />,
    label: "Image",
    description: "Single image with caption",
    category: "Core",
  },
  {
    type: BLOCK_TYPES.CODE,
    icon: <IconCode size={18} />,
    label: "Code",
    description: "Syntax-highlighted code snippets",
    category: "Core",
  },
  {
    type: BLOCK_TYPES.SPACER,
    icon: <IconSeparator size={18} />,
    label: "Spacer",
    description: "Adjustable vertical space",
    category: "Core",
  },
  // Callouts
  {
    type: BLOCK_TYPES.CALLOUT_BLOCK,
    icon: <IconNote size={18} />,
    label: "Note box",
    description: "Neutral note box",
    category: "Callouts",
    initialContent: createCalloutContent("note"),
  },
  {
    type: BLOCK_TYPES.CALLOUT_BLOCK,
    icon: <IconInfoCircle size={18} />,
    label: "Info box",
    description: "Blue info callout",
    category: "Callouts",
    initialContent: createCalloutContent("info"),
  },
  {
    type: BLOCK_TYPES.CALLOUT_BLOCK,
    icon: <IconAlertTriangle size={18} />,
    label: "Warning box",
    description: "Yellow warning alert",
    category: "Callouts",
    initialContent: createCalloutContent("warning"),
  },
  // Interactive
  {
    type: BLOCK_TYPES.BUTTON_BLOCK,
    icon: <IconClick size={18} />,
    label: "Button",
    description: "Clickable button",
    category: "Interactive",
    initialContent: createButtonBlockContent(),
  },
  {
    type: BLOCK_TYPES.CALLOUT_BLOCK,
    icon: <IconAlertOctagon size={18} />,
    label: "Error box",
    description: "Red error/caution",
    category: "Callouts",
    initialContent: createCalloutContent("error"),
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
              <div className="space-y-6">
                {Array.from(new Set(blockDefinitions.map(b => b.category))).map(category => (
                  <div key={category}>
                    <h3
                      className="text-[10px] uppercase tracking-wider font-semibold mb-2 px-1 opacity-40 font-mono"
                      style={{ color: isDark ? "#fff" : "#000" }}
                    >
                      {category}
                    </h3>
                    <div className="grid grid-cols-4 gap-1">
                      {blockDefinitions
                        .filter(b => b.category === category)
                        .map((block, index) => (
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
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
