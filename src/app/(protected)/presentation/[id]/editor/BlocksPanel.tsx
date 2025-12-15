import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/slidesSlice";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BLOCK_TYPES } from "./blocks/definitions";
import {
  IconFileText,
  IconHash,
  IconMessageCircle,
  IconTarget,
  IconQuote,
  IconTimeline,
  IconUsers,
  IconCreditCard,
  IconPhoto,
  IconChartBar,
  IconListCheck,
  IconTable,
  IconHelp,
  IconBrandAppstore,
  IconVideo,
  IconCode,
  IconProgress,
  IconBrandTwitter,
  IconAward,
  IconTerminal2,
  IconActivity,
  IconBulb,
  IconSeparator,
} from "@tabler/icons-react";

interface BlocksPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DraggableBlockOptionProps {
  id: string;
  blockType: string;
  icon: React.ReactNode;
  label: string;
  description: string;
}

const DraggableBlockOption: React.FC<
  DraggableBlockOptionProps & { theme: any; isDark: boolean }
> = ({ id, blockType, icon, label, theme, isDark }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      data: { type: "block-option", blockType },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing"
    >
      <div
        className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl transition-all h-full text-center"
        style={{
          backgroundColor: isDragging ? `${theme.primary}15` : "transparent",
        }}
        onMouseEnter={(e) => {
          if (!isDragging) {
            e.currentTarget.style.backgroundColor = `${theme.primary}10`;
          }
        }}
        onMouseLeave={(e) => {
          if (!isDragging) {
            e.currentTarget.style.backgroundColor = "transparent";
          }
        }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center mb-0.5"
          style={{
            backgroundColor: `${theme.primary}15`,
            color: theme.primary,
          }}
        >
          {icon}
        </div>
        <div
          className="font-medium text-[11px] leading-tight"
          style={{ color: isDark ? "#e5e7eb" : "#374151" }}
        >
          {label}
        </div>
      </div>
    </div>
  );
};

const blockDefinitions = [
  {
    type: BLOCK_TYPES.PROSEMIRROR,
    icon: <IconFileText size={18} />,
    label: "Text",
    description: "Rich text editor with formatting",
  },
  {
    type: BLOCK_TYPES.NUMBER_CARD,
    icon: <IconHash size={18} />,
    label: "Number Card",
    description: "Icon, number, and description",
  },
  {
    type: BLOCK_TYPES.TESTIMONIAL,
    icon: <IconMessageCircle size={18} />,
    label: "Testimonial",
    description: "Customer quote with name and role",
  },
  {
    type: BLOCK_TYPES.CTA,
    icon: <IconTarget size={18} />,
    label: "CTA Banner",
    description: "Call-to-action with button",
  },
  {
    type: BLOCK_TYPES.QUOTE,
    icon: <IconQuote size={18} />,
    label: "Quote",
    description: "Inspiring quote with author",
  },
  {
    type: BLOCK_TYPES.TIMELINE,
    icon: <IconTimeline size={18} />,
    label: "Timeline",
    description: "Step-by-step process visualization",
  },
  {
    type: BLOCK_TYPES.TEAM_CARD,
    icon: <IconUsers size={18} />,
    label: "Team",
    description: "Profile card with social links",
  },
  {
    type: BLOCK_TYPES.PRICING_CARD,
    icon: <IconCreditCard size={18} />,
    label: "Pricing",
    description: "Feature comparison card",
  },
  {
    type: BLOCK_TYPES.IMAGE_GALLERY,
    icon: <IconPhoto size={18} />,
    label: "Gallery",
    description: "Grid layout for multiple images",
  },
  {
    type: BLOCK_TYPES.STATS_COUNTER,
    icon: <IconChartBar size={18} />,
    label: "Stats",
    description: "Animated statistics and metrics",
  },
  {
    type: BLOCK_TYPES.FEATURE_LIST,
    icon: <IconListCheck size={18} />,
    label: "Features",
    description: "Showcase features with icons",
  },
  {
    type: BLOCK_TYPES.COMPARISON_TABLE,
    icon: <IconTable size={18} />,
    label: "Compare",
    description: "Compare features side-by-side",
  },
  {
    type: BLOCK_TYPES.FAQ,
    icon: <IconHelp size={18} />,
    label: "FAQ",
    description: "Expandable questions and answers",
  },
  {
    type: BLOCK_TYPES.LOGO_GRID,
    icon: <IconBrandAppstore size={18} />,
    label: "Logos",
    description: "Showcase partners and clients",
  },
  {
    type: BLOCK_TYPES.VIDEO,
    icon: <IconVideo size={18} />,
    label: "Video",
    description: "Embed YouTube or Vimeo videos",
  },
  {
    type: BLOCK_TYPES.CODE,
    icon: <IconCode size={18} />,
    label: "Code",
    description: "Syntax-highlighted code snippets",
  },
  {
    type: BLOCK_TYPES.PROGRESS_BAR,
    icon: <IconProgress size={18} />,
    label: "Progress",
    description: "Animated progress indicators",
  },
  {
    type: BLOCK_TYPES.SOCIAL_PROOF,
    icon: <IconBrandTwitter size={18} />,
    label: "Social",
    description: "Social media stats and ratings",
  },
  {
    type: BLOCK_TYPES.SIMPLE_NUMBER_CARD,
    icon: <IconHash size={18} />,
    label: "Number",
    description: "Minimalist number with text",
  },
  {
    type: BLOCK_TYPES.BADGE,
    icon: <IconAward size={18} />,
    label: "Badge",
    description: "Awards and certifications",
  },
  {
    type: BLOCK_TYPES.CODE_TERMINAL,
    icon: <IconTerminal2 size={18} />,
    label: "Terminal",
    description: "Mini terminal window",
  },
  {
    type: BLOCK_TYPES.PULSE_METRIC,
    icon: <IconActivity size={18} />,
    label: "Pulse",
    description: "Animated growth metric",
  },
  {
    type: BLOCK_TYPES.GLASS_INSIGHT,
    icon: <IconBulb size={18} />,
    label: "Insight",
    description: "Key takeaway box",
  },
  {
    type: BLOCK_TYPES.SPACER,
    icon: <IconSeparator size={18} />,
    label: "Spacer",
    description: "Adjustable vertical space",
  },
];

export const BlocksPanel: React.FC<BlocksPanelProps> = ({
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
            <div className={`relative flex-1 overflow-y-auto px-3 pb-3 ${isDark ? 'custom-scrollbar-dark' : 'custom-scrollbar-light'}`}>
              <p
                className="text-[11px] font-medium mb-2 px-1 opacity-50"
                style={{ color: isDark ? "#fff" : "#000" }}
              >
                Drag to add to your slide
              </p>
              <div className="grid grid-cols-4 gap-1">
                {blockDefinitions.map((block) => (
                  <DraggableBlockOption
                    key={block.type}
                    id={`block-option-${block.type}`}
                    blockType={block.type}
                    icon={block.icon}
                    label={block.label}
                    description={block.description}
                    theme={theme}
                    isDark={isDark}
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
