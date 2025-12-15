import React, { useState, useRef } from "react";
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

  const buttonClass = "p-1 rounded-md transition-all flex items-center justify-center";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.12 }}
          className="absolute -top-10 left-1/2 -translate-x-1/2 z-50"
          data-block-action-bar
        >
          <div
            className="flex items-center gap-0.5 px-1 py-0.5 rounded-lg"
            style={{
              backgroundColor: isDark ? "rgba(30,30,35,0.95)" : "rgba(255,255,255,0.98)",
              backdropFilter: "blur(12px)",
            }}
          >
            {/* Drag Handle */}
            <button
              {...dragHandleProps}
              className={`${buttonClass} cursor-grab active:cursor-grabbing`}
              style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)" }}
              title="Drag to move"
            >
              <IconGripVertical size={14} />
            </button>

            <div
              className="w-px h-3 mx-0.5"
              style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)" }}
            />

            {/* Move Up */}
            <button
              onClick={onMoveUp}
              disabled={!canMoveUp}
              className={buttonClass}
              style={{
                color: !canMoveUp
                  ? (isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)")
                  : (isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)"),
              }}
              title="Move up"
            >
              <IconArrowUp size={14} />
            </button>

            {/* Move Down */}
            <button
              onClick={onMoveDown}
              disabled={!canMoveDown}
              className={buttonClass}
              style={{
                color: !canMoveDown
                  ? (isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)")
                  : (isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)"),
              }}
              title="Move down"
            >
              <IconArrowDown size={14} />
            </button>

            <div
              className="w-px h-3 mx-0.5"
              style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)" }}
            />

            {/* Transform */}
            <button
              ref={transformButtonRef}
              onClick={() => setIsTransformMenuOpen(!isTransformMenuOpen)}
              className={buttonClass}
              style={{
                color: isTransformMenuOpen
                  ? theme.primary
                  : (isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)"),
              }}
              title="Change type"
            >
              <IconTransform size={14} />
            </button>

            {/* Duplicate */}
            <button
              onClick={onDuplicate}
              className={buttonClass}
              style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)" }}
              title="Duplicate"
            >
              <IconCopy size={14} />
            </button>

            {/* Delete */}
            <button
              onClick={onDelete}
              className={buttonClass}
              style={{ color: "#ef4444" }}
              title="Delete"
            >
              <IconTrash size={14} />
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
