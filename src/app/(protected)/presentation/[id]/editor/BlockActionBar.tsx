import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/slidesSlice";
import {
  IconTrash,
  IconCopy,
  IconTransform,
  IconArrowUp,
  IconArrowDown,
  IconGripVertical,
} from "@tabler/icons-react";
import { BlockTransformMenu } from "./BlockTransformMenu";
import type { Block } from "@/lib/editor/types";

interface BlockActionBarProps {
  block: Block;
  isVisible: boolean;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onTransform: (newType: string) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  dragHandleProps?: Record<string, any>;
}

export const BlockActionBar: React.FC<BlockActionBarProps> = ({
  block,
  isVisible,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onTransform,
  canMoveUp,
  canMoveDown,
  dragHandleProps,
}) => {
  const [isTransformMenuOpen, setIsTransformMenuOpen] = useState(false);
  const transformButtonRef = useRef<HTMLButtonElement>(null);
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const isDark = theme.themeType === "dark";

  const buttonBaseClass =
    "p-1.5 rounded-md transition-all duration-150 flex items-center justify-center";

  const getButtonStyle = (disabled = false) => ({
    color: disabled
      ? isDark
        ? "rgba(255,255,255,0.3)"
        : "rgba(0,0,0,0.3)"
      : isDark
        ? "#e5e7eb"
        : "#374151",
    cursor: disabled ? "not-allowed" : "pointer",
  });

  const handleButtonHover = (
    e: React.MouseEvent<HTMLButtonElement>,
    isEntering: boolean,
    disabled = false
  ) => {
    if (disabled) return;
    e.currentTarget.style.backgroundColor = isEntering
      ? isDark
        ? "rgba(255,255,255,0.1)"
        : "rgba(0,0,0,0.08)"
      : "transparent";
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="absolute -top-12 left-1/2 -translate-x-1/2 z-50"
        >
          <div
            className="flex items-center gap-0.5 px-1.5 py-1 rounded-lg shadow-xl backdrop-blur-md"
            style={{
              backgroundColor: isDark
                ? "rgba(30, 30, 35, 0.95)"
                : "rgba(255, 255, 255, 0.98)",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
              boxShadow: isDark
                ? "0 8px 32px rgba(0,0,0,0.5)"
                : "0 8px 32px rgba(0,0,0,0.15)",
            }}
          >
            {/* Drag Handle */}
            <button
              {...dragHandleProps}
              className={`${buttonBaseClass} cursor-grab active:cursor-grabbing`}
              style={getButtonStyle()}
              title="Drag to move"
            >
              <IconGripVertical size={16} />
            </button>

            <div
              className="w-px h-4 mx-0.5"
              style={{
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.1)",
              }}
            />

            {/* Move Up */}
            <button
              onClick={onMoveUp}
              disabled={!canMoveUp}
              className={buttonBaseClass}
              style={getButtonStyle(!canMoveUp)}
              onMouseEnter={(e) => handleButtonHover(e, true, !canMoveUp)}
              onMouseLeave={(e) => handleButtonHover(e, false, !canMoveUp)}
              title="Move up"
            >
              <IconArrowUp size={16} />
            </button>

            {/* Move Down */}
            <button
              onClick={onMoveDown}
              disabled={!canMoveDown}
              className={buttonBaseClass}
              style={getButtonStyle(!canMoveDown)}
              onMouseEnter={(e) => handleButtonHover(e, true, !canMoveDown)}
              onMouseLeave={(e) => handleButtonHover(e, false, !canMoveDown)}
              title="Move down"
            >
              <IconArrowDown size={16} />
            </button>

            <div
              className="w-px h-4 mx-0.5"
              style={{
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.1)",
              }}
            />

            {/* Transform */}
            <button
              ref={transformButtonRef}
              onClick={() => setIsTransformMenuOpen(!isTransformMenuOpen)}
              className={buttonBaseClass}
              style={{
                ...getButtonStyle(),
                backgroundColor: isTransformMenuOpen
                  ? isDark
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.08)"
                  : "transparent",
              }}
              onMouseEnter={(e) => handleButtonHover(e, true)}
              onMouseLeave={(e) => {
                if (!isTransformMenuOpen) handleButtonHover(e, false);
              }}
              title="Change block type"
            >
              <IconTransform size={16} />
            </button>

            {/* Duplicate */}
            <button
              onClick={onDuplicate}
              className={buttonBaseClass}
              style={getButtonStyle()}
              onMouseEnter={(e) => handleButtonHover(e, true)}
              onMouseLeave={(e) => handleButtonHover(e, false)}
              title="Duplicate block"
            >
              <IconCopy size={16} />
            </button>

            {/* Delete */}
            <button
              onClick={onDelete}
              className={buttonBaseClass}
              style={{
                color: "#ef4444",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
              title="Delete block"
            >
              <IconTrash size={16} />
            </button>
          </div>

          {/* Transform Menu */}
          <BlockTransformMenu
            isOpen={isTransformMenuOpen}
            onClose={() => setIsTransformMenuOpen(false)}
            onSelect={(type) => {
              onTransform(type);
              setIsTransformMenuOpen(false);
            }}
            currentType={block.type || "prosemirror"}
            anchorRef={transformButtonRef}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
