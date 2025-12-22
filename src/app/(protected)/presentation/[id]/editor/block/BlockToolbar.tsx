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
import { cn } from "@/lib/utils";

interface BlockToolbarProps {
  isVisible: boolean;
  onDuplicate: () => void;
  onDelete: () => void;
  onAddColumn?: () => void;
  canAddColumn?: boolean;
}

export const BlockToolbar: React.FC<BlockToolbarProps> = ({
  isVisible,
  onDuplicate,
  onDelete,
  onAddColumn,
  canAddColumn,
}) => {
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const isDark = theme.themeType === "dark";

  const buttonClass = cn(
    "w-8 h-8 rounded-lg transition-all flex items-center justify-center hover:text-primary hover:bg-black/5 dark:hover:bg-white/10",
    isDark ? "text-white/60" : "text-muted-foreground"
  );

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
            className="flex flex-col items-center gap-1 p-1 rounded-xl shadow-2xl border backdrop-blur-2xl"
            style={{
              backgroundColor: isDark ? "rgba(0, 0, 0, 0.2)" : "rgba(255, 255, 255, 0.4)",
              borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
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

