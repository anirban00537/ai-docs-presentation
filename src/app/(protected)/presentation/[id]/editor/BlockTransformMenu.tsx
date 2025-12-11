import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/slidesSlice";
import { BLOCK_TYPES } from "./blocks/definitions";
import {
  IconFileText,
  IconHash,
  IconMessageCircle,
  IconTarget,
  IconQuote,
  IconMinus,
  IconTimeline,
  IconCheck,
} from "@tabler/icons-react";

interface BlockTransformMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: string) => void;
  currentType: string;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}

const blockTypeOptions = [
  {
    type: BLOCK_TYPES.PROSEMIRROR,
    icon: IconFileText,
    label: "Text",
    description: "Rich text content",
  },
  {
    type: BLOCK_TYPES.NUMBER_CARD,
    icon: IconHash,
    label: "Number Card",
    description: "Statistic with icon",
  },
  {
    type: BLOCK_TYPES.TESTIMONIAL,
    icon: IconMessageCircle,
    label: "Testimonial",
    description: "Quote with author",
  },
  {
    type: BLOCK_TYPES.CTA,
    icon: IconTarget,
    label: "CTA Banner",
    description: "Call to action",
  },
  {
    type: BLOCK_TYPES.QUOTE,
    icon: IconQuote,
    label: "Quote",
    description: "Highlighted quote",
  },
  {
    type: BLOCK_TYPES.DIVIDER,
    icon: IconMinus,
    label: "Divider",
    description: "Section separator",
  },
  {
    type: BLOCK_TYPES.TIMELINE,
    icon: IconTimeline,
    label: "Timeline",
    description: "Step-by-step process",
  },
];

export const BlockTransformMenu: React.FC<BlockTransformMenuProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentType,
  anchorRef,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const isDark = theme.themeType === "dark";

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose, anchorRef]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50"
        >
          <div
            className="w-56 rounded-xl shadow-2xl backdrop-blur-md overflow-hidden"
            style={{
              backgroundColor: isDark
                ? "rgba(30, 30, 35, 0.98)"
                : "rgba(255, 255, 255, 0.98)",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
              boxShadow: isDark
                ? "0 16px 48px rgba(0,0,0,0.6)"
                : "0 16px 48px rgba(0,0,0,0.2)",
            }}
          >
            {/* Header */}
            <div
              className="px-3 py-2 text-xs font-medium"
              style={{
                color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
                borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
              }}
            >
              Transform to
            </div>

            {/* Options */}
            <div className="py-1 max-h-[280px] overflow-y-auto">
              {blockTypeOptions.map((option) => {
                const isActive = option.type === currentType;
                const Icon = option.icon;

                return (
                  <button
                    key={option.type}
                    onClick={() => onSelect(option.type)}
                    disabled={isActive}
                    className="w-full px-3 py-2 flex items-center gap-3 transition-colors text-left"
                    style={{
                      backgroundColor: isActive
                        ? isDark
                          ? "rgba(37,99,235,0.15)"
                          : "rgba(37,99,235,0.1)"
                        : "transparent",
                      color: isDark ? "#e5e7eb" : "#374151",
                      cursor: isActive ? "default" : "pointer",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = isDark
                          ? "rgba(255,255,255,0.08)"
                          : "rgba(0,0,0,0.05)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: isActive
                          ? theme.primary
                          : isDark
                            ? "rgba(255,255,255,0.08)"
                            : "rgba(0,0,0,0.06)",
                        color: isActive
                          ? "#fff"
                          : isDark
                            ? "rgba(255,255,255,0.7)"
                            : "rgba(0,0,0,0.6)",
                      }}
                    >
                      <Icon size={16} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm font-medium"
                        style={{
                          color: isDark ? "#e5e7eb" : "#1f2937",
                        }}
                      >
                        {option.label}
                      </div>
                      <div
                        className="text-xs"
                        style={{
                          color: isDark
                            ? "rgba(255,255,255,0.5)"
                            : "rgba(0,0,0,0.5)",
                        }}
                      >
                        {option.description}
                      </div>
                    </div>

                    {isActive && (
                      <IconCheck
                        size={16}
                        style={{ color: theme.primary }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
