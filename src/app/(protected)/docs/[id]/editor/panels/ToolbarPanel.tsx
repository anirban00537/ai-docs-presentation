import React, { useState, useEffect } from "react";
import { IconPalette, IconBlocks, IconPhoto, IconLayoutGrid } from "@tabler/icons-react";
import { ThemeSelectorPanel } from "./ThemeSelectorPanel";
import { BlockLibraryPanel } from "./BlockLibraryPanel";
import { LayoutsPanel } from "./LayoutsPanel";
import { ImageLibraryPanel } from "./ImageLibraryPanel";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/cardsSlice";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ToolbarPanelProps {
  docId: string;
}

export const ToolbarPanel: React.FC<ToolbarPanelProps> = ({
  docId,
}) => {
  const [isThemePanelOpen, setIsThemePanelOpen] = useState(false);
  const [isBlocksPanelOpen, setIsBlocksPanelOpen] = useState(false);
  const [isLayoutsPanelOpen, setIsLayoutsPanelOpen] = useState(false);
  const [isImagesPanelOpen, setIsImagesPanelOpen] = useState(false);
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const isDark = theme.themeType === "dark";

  // Close panels when clicking outside
  useEffect(() => {
    if (isThemePanelOpen || isBlocksPanelOpen || isImagesPanelOpen || isLayoutsPanelOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (
          !target.closest('[data-floating-sidebar]') &&
          !target.closest('[data-theme-panel]') &&
          !target.closest('[data-blocks-panel]') &&
          !target.closest('[data-layouts-panel]') &&
          !target.closest('[data-images-panel]')
        ) {
          setIsThemePanelOpen(false);
          setIsBlocksPanelOpen(false);
          setIsLayoutsPanelOpen(false);
          setIsImagesPanelOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isThemePanelOpen, isBlocksPanelOpen, isLayoutsPanelOpen, isImagesPanelOpen]);

  const handleToggleThemePanel = () => {
    setIsThemePanelOpen(!isThemePanelOpen);
    setIsBlocksPanelOpen(false);
    setIsLayoutsPanelOpen(false);
    setIsImagesPanelOpen(false);
  };

  const handleToggleBlocksPanel = () => {
    setIsBlocksPanelOpen(!isBlocksPanelOpen);
    setIsThemePanelOpen(false);
    setIsLayoutsPanelOpen(false);
    setIsImagesPanelOpen(false);
  };

  const handleToggleLayoutsPanel = () => {
    setIsLayoutsPanelOpen(!isLayoutsPanelOpen);
    setIsThemePanelOpen(false);
    setIsBlocksPanelOpen(false);
    setIsImagesPanelOpen(false);
  };

  const handleToggleImagesPanel = () => {
    setIsImagesPanelOpen(!isImagesPanelOpen);
    setIsThemePanelOpen(false);
    setIsBlocksPanelOpen(false);
    setIsLayoutsPanelOpen(false);
  };

  const buttonClass = "p-2 md:p-2.5 rounded-xl transition-all";

  return (
    <>
      {/* Floating Sidebar Buttons */}
      <div
        data-floating-sidebar
        className={cn(
          "fixed z-[45] flex shadow-2xl transition-all duration-300",
          "bottom-6 left-1/2 -translate-x-1/2 flex-row md:flex-col md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:right-4 md:left-auto md:translate-x-0"
        )}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-2xl md:rounded-3xl flex flex-row md:flex-col gap-0.5 md:gap-1.5 p-1.5"
          style={{
            backgroundColor: isDark 
              ? "rgba(30, 30, 40, 0.6)" 
              : "rgba(255, 255, 255, 0.6)",
            backdropFilter: "blur(32px) saturate(200%)",
            WebkitBackdropFilter: "blur(32px) saturate(200%)",
            boxShadow: isDark
              ? "0 8px 32px rgba(0, 0, 0, 0.3), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
              : "0 8px 32px rgba(0, 0, 0, 0.05), 0 1px 0 rgba(255, 255, 255, 0.8) inset",
          }}
        >
          {/* Blocks Button */}
          <button
            onClick={handleToggleBlocksPanel}
            className={cn(buttonClass)}
            style={{
              backgroundColor: isBlocksPanelOpen ? `${theme.primary}20` : "transparent",
              color: isBlocksPanelOpen ? theme.primary : (isDark ? "#fff" : "#000"),
            }}
            title="Add blocks"
          >
            <IconBlocks size={22} stroke={1.5} />
          </button>

          <button
            onClick={handleToggleLayoutsPanel}
            className={cn(buttonClass)}
            style={{
              backgroundColor: isLayoutsPanelOpen ? `${theme.primary}20` : "transparent",
              color: isLayoutsPanelOpen ? theme.primary : (isDark ? "#fff" : "#000"),
            }}
            title="Add layouts"
          >
            <IconLayoutGrid size={22} stroke={1.5} />
          </button>

          <button
            onClick={handleToggleImagesPanel}
            className={cn(buttonClass)}
            style={{
              backgroundColor: isImagesPanelOpen ? `${theme.primary}20` : "transparent",
              color: isImagesPanelOpen ? theme.primary : (isDark ? "#fff" : "#000"),
            }}
            title="Add images"
          >
            <IconPhoto size={22} stroke={1.5} />
          </button>

          <button
            onClick={handleToggleThemePanel}
            className={cn(buttonClass)}
            style={{
              backgroundColor: isThemePanelOpen ? `${theme.primary}20` : "transparent",
              color: isThemePanelOpen ? theme.primary : (isDark ? "#fff" : "#000"),
            }}
            title="Change theme"
          >
            <IconPalette size={22} stroke={1.5} />
          </button>
        </motion.div>
      </div>

      {/* Panels - Adjusted for mobile */}
      <AnimatePresence>
        {isBlocksPanelOpen && (
          <motion.div
            data-blocks-panel
            initial={{ opacity: 0, y: 20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:right-16 md:left-auto md:translate-x-0"
          >
            <BlockLibraryPanel
              isOpen={isBlocksPanelOpen}
              onClose={() => setIsBlocksPanelOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLayoutsPanelOpen && (
          <motion.div
            data-layouts-panel
            initial={{ opacity: 0, y: 20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:right-16 md:left-auto md:translate-x-0"
          >
            <LayoutsPanel
              isOpen={isLayoutsPanelOpen}
              onClose={() => setIsLayoutsPanelOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isImagesPanelOpen && (
          <motion.div
            data-images-panel
            initial={{ opacity: 0, y: 20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:right-16 md:left-auto md:translate-x-0"
          >
            <ImageLibraryPanel
              isOpen={isImagesPanelOpen}
              onClose={() => setIsImagesPanelOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isThemePanelOpen && (
          <motion.div
            data-theme-panel
            initial={{ opacity: 0, y: 20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:right-16 md:left-auto md:translate-x-0"
          >
            <ThemeSelectorPanel
              isOpen={isThemePanelOpen}
              onClose={() => setIsThemePanelOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
