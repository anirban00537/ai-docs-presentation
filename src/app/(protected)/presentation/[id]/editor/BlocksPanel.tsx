import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/slidesSlice";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BLOCK_TYPES } from "./blocks/definitions";
import {
  IconFileText,
  IconHash,
  IconMessageCircle,
  IconTarget,
  IconQuote,
  IconMinus,
  IconTimeline,
  IconUsers,
  IconCreditCard,
  IconPhoto,
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
> = ({ id, blockType, icon, label, description, theme, isDark }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      data: { type: "block-option", blockType },
    });

  const accent = theme.primary;
  const textPrimary = isDark ? "#e5e7eb" : "#0f172a";
  const textSecondary = isDark ? "#cbd5e1" : "#475569";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb";

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
        className="flex items-start gap-3 p-3 rounded-lg border transition-all hover:shadow-md"
        style={{
          backgroundColor: isDragging
            ? (isDark ? "rgba(96,165,250,0.15)" : "rgba(37,99,235,0.1)")
            : "transparent",
          borderColor: isDragging
            ? accent
            : (isDark ? "rgba(255,255,255,0.08)" : "rgba(148,163,184,0.2)"),
          color: textPrimary,
        }}
        onMouseEnter={(e) => {
          if (!isDragging) {
            e.currentTarget.style.borderColor = accent;
            e.currentTarget.style.backgroundColor = isDark
              ? "rgba(255,255,255,0.05)"
              : "rgba(37,99,235,0.05)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isDragging) {
            e.currentTarget.style.borderColor = isDark
              ? "rgba(255,255,255,0.08)"
              : "rgba(148,163,184,0.2)";
            e.currentTarget.style.backgroundColor = "transparent";
          }
        }}
      >
        <div
          className="text-2xl shrink-0 flex items-center justify-center"
          style={{ color: theme.primary }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm" style={{ color: textPrimary }}>
            {label}
          </div>
          <div
            className="text-xs mt-0.5"
            style={{ color: textSecondary, opacity: 0.8 }}
          >
            {description}
          </div>
        </div>
      </div>
    </div>
  );
};

const blockDefinitions = [
  {
    type: BLOCK_TYPES.PROSEMIRROR,
    icon: <IconFileText className="w-6 h-6" />,
    label: "Text",
    description: "Rich text editor with formatting",
  },
  {
    type: BLOCK_TYPES.NUMBER_CARD,
    icon: <IconHash className="w-6 h-6" />,
    label: "Number Card",
    description: "Icon, number, and description",
  },
  {
    type: BLOCK_TYPES.TESTIMONIAL,
    icon: <IconMessageCircle className="w-6 h-6" />,
    label: "Testimonial",
    description: "Customer quote with name and role",
  },
  {
    type: BLOCK_TYPES.CTA,
    icon: <IconTarget className="w-6 h-6" />,
    label: "CTA Banner",
    description: "Call-to-action with button",
  },
  {
    type: BLOCK_TYPES.QUOTE,
    icon: <IconQuote className="w-6 h-6" />,
    label: "Quote",
    description: "Inspiring quote with author",
  },
  {
    type: BLOCK_TYPES.DIVIDER,
    icon: <IconMinus className="w-6 h-6" />,
    label: "Divider",
    description: "Visual separator between sections",
  },
  {
    type: BLOCK_TYPES.TIMELINE,
    icon: <IconTimeline className="w-6 h-6" />,
    label: "Timeline",
    description: "Step-by-step process visualization",
  },
  {
    type: BLOCK_TYPES.TEAM_CARD,
    icon: <IconUsers className="w-6 h-6" />,
    label: "Team Member",
    description: "Profile card with social links",
  },
  {
    type: BLOCK_TYPES.PRICING_CARD,
    icon: <IconCreditCard className="w-6 h-6" />,
    label: "Pricing Plan",
    description: "Feature comparison card",
  },
  {
    type: BLOCK_TYPES.IMAGE_GALLERY,
    icon: <IconPhoto className="w-6 h-6" />,
    label: "Image Gallery",
    description: "Grid layout for multiple images",
  },
];

export const BlocksPanel: React.FC<BlocksPanelProps> = ({ isOpen, onClose }) => {
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const isDark = theme.themeType === "dark";
  const textPrimary = isDark ? "#e5e7eb" : "#0f172a";
  const textSecondary = isDark ? "#cbd5e1" : "#475569";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb";

  // Animation variants
  const panelVariants = {
    hidden: {
      opacity: 0,
      x: 20,
      scale: 0.95,
      transition: { duration: 0.2, ease: "easeInOut" as const },
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut" as const,
        staggerChildren: 0.05,
      },
    },
    exit: {
      opacity: 0,
      x: 20,
      scale: 0.95,
      transition: { duration: 0.2, ease: "easeInOut" as const },
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
            className="w-80 h-[600px] max-h-[80vh] flex flex-col rounded-xl backdrop-blur-sm overflow-hidden shadow-xl"
            style={{
              backgroundColor: isDark
                ? "rgba(12,12,14,0.9)"
                : theme.cardBackground + "E6",
              border: `1px solid ${borderColor}`,
            }}
          >
            {/* Header */}
            <div
              className="px-3 py-2.5 flex items-center justify-between gap-1 shrink-0"
              style={{
                borderBottom: `1px solid ${borderColor}`,
              }}
            >
              <div
                className="text-sm font-medium px-1"
                style={{ color: textPrimary }}
              >
                Blocks
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onClose}
                style={{
                  color: textSecondary,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDark
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Blocks List */}
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar custom-scrollbar-light">
              <div
                className="text-xs font-medium mb-2 px-1"
                style={{ color: textSecondary, opacity: 0.7 }}
              >
                Drag a block to add it to your slide
              </div>
              <div className="flex flex-col gap-2">
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

