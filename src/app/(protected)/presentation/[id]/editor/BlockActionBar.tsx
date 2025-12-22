import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/slidesSlice";
import {
  IconTrash,
  IconCopy,
  IconPlus,
} from "@tabler/icons-react";
import { type Block } from "@/types/presentation";

interface BlockActionBarProps {
  isVisible: boolean;
  onDuplicate: () => void;
  onDelete: () => void;
  onAddColumn?: () => void;
  canAddColumn?: boolean;
}

export const BlockActionBar: React.FC<BlockActionBarProps> = ({
  isVisible,
  onDuplicate,
  onDelete,
  onAddColumn,
  canAddColumn,
}) => {
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const isDark = theme.themeType === "dark";

  const buttonClass = "w-8 h-8 rounded-lg transition-all flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2, ease: "circOut" }}
          className="absolute top-0 right-0 translate-x-[calc(100%+8px)] z-[100]"
          data-block-action-bar
        >
          <div
            className="flex flex-col items-center gap-1 p-1 rounded-xl shadow-xl border border-black/5 dark:border-white/10"
            style={{
              backgroundColor: isDark ? "rgba(30,30,35,0.95)" : "rgba(255,255,255,0.98)",
              backdropFilter: "blur(16px)",
            }}
          >
            {/* Add Column (Contextual) */}
            {canAddColumn && onAddColumn && (
              <button
                onClick={onAddColumn}
                className={buttonClass}
                style={{ color: theme.primary }}
                title="Add Column"
              >
                <IconPlus size={16} stroke={2.5} />
              </button>
            )}

            {/* Duplicate */}
            <button
              onClick={onDuplicate}
              className={buttonClass}
              style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)" }}
              title="Duplicate"
            >
              <IconCopy size={16} />
            </button>

            <div className="w-4 h-px bg-black/5 dark:bg-white/5 mx-auto" />

            {/* Delete */}
            <button
              onClick={onDelete}
              className={buttonClass}
              style={{ color: "#ef4444" }}
              title="Delete"
            >
              <IconTrash size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
