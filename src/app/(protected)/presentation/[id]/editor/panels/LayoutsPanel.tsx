import React from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME, addRowWithColumnsAtIndex, selectActiveSlideId } from "@/store/slices/slidesSlice";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BLOCK_TYPES } from "../blocks/definitions";
import {
  IconNumber,
  IconLayersIntersect,
  IconBoxModel,
  IconStar,
  IconLayoutSidebarLeftCollapse,
  IconColumns3,
} from "@tabler/icons-react";
import { LayoutOption } from "../block/LayoutOption";

interface LayoutsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LayoutDefinition {
  id: string;
  blockType: string;
  icon: React.ReactNode;
  label: string;
  description: string;
}

// Only 3-column layouts
const layoutDefinitions: LayoutDefinition[] = [
  {
    id: "simple-number-3col",
    blockType: BLOCK_TYPES.SIMPLE_NUMBER_CARD,
    icon: <IconNumber size={18} />,
    label: "Simple Number",
    description: "Three minimalist number cards",
  },
  {
    id: "layered-3col",
    blockType: BLOCK_TYPES.LAYERED_NUMBER_BLOCK,
    icon: <IconLayersIntersect size={18} />,
    label: "Layered",
    description: "Three depth-effect numbers",
  },
  {
    id: "solid-box-3col",
    blockType: BLOCK_TYPES.SOLID_BOX_BLOCK,
    icon: <IconBoxModel size={18} />,
    label: "Solid Box",
    description: "Three solid colored boxes",
  },
  {
    id: "icon-box-3col",
    blockType: BLOCK_TYPES.SOLID_ICON_BOX_BLOCK,
    icon: <IconStar size={18} />,
    label: "Icon Box",
    description: "Three boxes with icons",
  },
  {
    id: "sideline-3col",
    blockType: BLOCK_TYPES.SIDELINE_CARD_BLOCK,
    icon: <IconLayoutSidebarLeftCollapse size={18} />,
    label: "Side Line",
    description: "Three accent-line cards",
  },
];

export function LayoutsPanel({ isOpen, onClose }: LayoutsPanelProps) {
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const dispatch = useAppDispatch();
  const isDark = theme.themeType === "dark";

  const handleLayoutClick = (layout: LayoutDefinition) => {
    if (!activeSlideId) return;
    
    // Add a new row with 3 columns
    dispatch(
      addRowWithColumnsAtIndex({
        slideId: activeSlideId,
        columnCount: 3,
        insertIndex: 999, // Insert at bottom
        blockType: layout.blockType,
      })
    );
    
    onClose();
  };

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
          key="layouts-panel"
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
                Add Layout
              </span>
              <button
                className="p-1.5 rounded-lg transition-all opacity-50 hover:opacity-100"
                onClick={onClose}
                style={{ color: isDark ? "#fff" : "#000" }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Layouts Grid */}
            <div
              className={`relative flex-1 overflow-y-auto px-3 pb-3 ${
                isDark ? "custom-scrollbar-dark" : "custom-scrollbar-light"
              }`}
            >
              <p
                className="text-[11px] font-medium mb-2 px-1 opacity-50"
                style={{ color: isDark ? "#fff" : "#000" }}
              >
                Drag to add 3 blocks at once
              </p>
              <div className="space-y-6">
                <div>
                  <h3
                    className="text-[10px] uppercase tracking-wider font-semibold mb-2 px-1 opacity-40 font-mono"
                    style={{ color: isDark ? "#fff" : "#000" }}
                  >
                    3 Columns
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {layoutDefinitions.map((layout) => (
                      <div
                        key={layout.id}
                        onClick={() => handleLayoutClick(layout)}
                        className="cursor-pointer"
                      >
                        <LayoutOption
                          id={layout.id}
                          icon={layout.icon}
                          label={layout.label}
                          blockType={layout.blockType}
                          columnCount={3}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollbar styles */}
            <style jsx>{`
              .custom-scrollbar-dark::-webkit-scrollbar {
                width: 6px;
              }
              .custom-scrollbar-dark::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 100px;
              }
              .custom-scrollbar-dark::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 100px;
              }
              .custom-scrollbar-dark::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.3);
              }
              .custom-scrollbar-light::-webkit-scrollbar {
                width: 6px;
              }
              .custom-scrollbar-light::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.05);
                border-radius: 100px;
              }
              .custom-scrollbar-light::-webkit-scrollbar-thumb {
                background: rgba(0, 0, 0, 0.2);
                border-radius: 100px;
              }
              .custom-scrollbar-light::-webkit-scrollbar-thumb:hover {
                background: rgba(0, 0, 0, 0.3);
              }
            `}</style>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
