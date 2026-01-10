import React, { useState, useEffect } from "react";
import { IconPalette, IconBlocks, IconPhoto, IconLayoutGrid } from "@tabler/icons-react";
import { ThemeSelectorPanel } from "./ThemeSelectorPanel";
import { BlockLibraryPanel } from "./BlockLibraryPanel";
import { LayoutsPanel } from "./LayoutsPanel";
import { ImageLibraryPanel } from "./ImageLibraryPanel";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/slidesSlice";
import { motion, AnimatePresence } from "framer-motion";

interface ToolbarPanelProps {
  presentationId: string;
}

export const ToolbarPanel: React.FC<ToolbarPanelProps> = ({
  presentationId,
}) => {
  const [isThemePanelOpen, setIsThemePanelOpen] = useState(false);
  const [isBlocksPanelOpen, setIsBlocksPanelOpen] = useState(false);
  const [isLayoutsPanelOpen, setIsLayoutsPanelOpen] = useState(false);
  const [isImagesPanelOpen, setIsImagesPanelOpen] = useState(false);
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const isDark = theme.themeType === "dark";

  // Close panels when clicking outside
  useEffect(() => {
    if (isThemePanelOpen || isBlocksPanelOpen || isImagesPanelOpen) {
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

  const buttonClass = "p-2.5 rounded-xl transition-all";

  return (
    <>
      {/* Floating Sidebar Buttons */}
      <div
        data-floating-sidebar
        className="fixed right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-1.5"
      >
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="relative rounded-2xl overflow-hidden"
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

          {/* Blocks Button */}
          <button
            onClick={handleToggleBlocksPanel}
            className={`relative ${buttonClass}`}
            style={{
              backgroundColor: isBlocksPanelOpen ? `${theme.primary}15` : "transparent",
              color: isBlocksPanelOpen ? theme.primary : (isDark ? "#fff" : "#000"),
            }}
            title="Add blocks"
          >
            <IconBlocks size={20} stroke={1.5} />
          </button>

          {/* Divider */}
          <div
            className="mx-2 h-px"
            style={{ backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }}
          />

          {/* Layouts Button */}
          <button
            onClick={handleToggleLayoutsPanel}
            className={`relative ${buttonClass}`}
            style={{
              backgroundColor: isLayoutsPanelOpen ? `${theme.primary}15` : "transparent",
              color: isLayoutsPanelOpen ? theme.primary : (isDark ? "#fff" : "#000"),
            }}
            title="Add layouts"
          >
            <IconLayoutGrid size={20} stroke={1.5} />
          </button>

          {/* Divider */}
          <div
            className="mx-2 h-px"
            style={{ backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }}
          />

          {/* Images Button */}
          <button
            onClick={handleToggleImagesPanel}
            className={`relative ${buttonClass}`}
            style={{
              backgroundColor: isImagesPanelOpen ? `${theme.primary}15` : "transparent",
              color: isImagesPanelOpen ? theme.primary : (isDark ? "#fff" : "#000"),
            }}
            title="Add images"
          >
            <IconPhoto size={20} stroke={1.5} />
          </button>

          {/* Divider */}
          <div
            className="mx-2 h-px"
            style={{ backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }}
          />

          {/* Theme Button */}
          <button
            onClick={handleToggleThemePanel}
            className={`relative ${buttonClass}`}
            style={{
              backgroundColor: isThemePanelOpen ? `${theme.primary}15` : "transparent",
              color: isThemePanelOpen ? theme.primary : (isDark ? "#fff" : "#000"),
            }}
            title="Change theme"
          >
            <IconPalette size={20} stroke={1.5} />
          </button>
        </motion.div>
      </div>

      {/* Blocks Panel */}
      <AnimatePresence>
        {isBlocksPanelOpen && (
          <motion.div
            data-blocks-panel
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="fixed right-16 top-1/2 -translate-y-1/2 z-50"
          >
            <BlockLibraryPanel
              isOpen={isBlocksPanelOpen}
              onClose={() => setIsBlocksPanelOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layouts Panel */}
      <AnimatePresence>
        {isLayoutsPanelOpen && (
          <motion.div
            data-layouts-panel
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="fixed right-16 top-1/2 -translate-y-1/2 z-50"
          >
            <LayoutsPanel
              isOpen={isLayoutsPanelOpen}
              onClose={() => setIsLayoutsPanelOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Images Panel */}
      <AnimatePresence>
        {isImagesPanelOpen && (
          <motion.div
            data-images-panel
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="fixed right-16 top-1/2 -translate-y-1/2 z-50"
          >
            <ImageLibraryPanel
              isOpen={isImagesPanelOpen}
              onClose={() => setIsImagesPanelOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Theme Panel */}
      <AnimatePresence>
        {isThemePanelOpen && (
          <motion.div
            data-theme-panel
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="fixed right-16 top-1/2 -translate-y-1/2 z-50"
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

