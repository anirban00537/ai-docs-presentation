import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { IconPalette, IconX, IconBlocks } from "@tabler/icons-react";
import { ThemePanel } from "./ThemePanel";
import { BlocksPanel } from "./BlocksPanel";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/slidesSlice";

interface FloatingSidebarProps {
  presentationId: string;
}

export const FloatingSidebar: React.FC<FloatingSidebarProps> = ({
  presentationId,
}) => {
  const [isThemePanelOpen, setIsThemePanelOpen] = useState(false);
  const [isBlocksPanelOpen, setIsBlocksPanelOpen] = useState(false);
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const isDark = theme.themeType === "dark";
  const accent = isDark ? "#60a5fa" : "#2563eb";
  const textPrimary = isDark ? "#e5e7eb" : "#0f172a";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb";

  // Close panels when clicking outside
  useEffect(() => {
    if (isThemePanelOpen || isBlocksPanelOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (
          !target.closest('[data-floating-sidebar]') &&
          !target.closest('[data-theme-panel]') &&
          !target.closest('[data-blocks-panel]')
        ) {
          setIsThemePanelOpen(false);
          setIsBlocksPanelOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isThemePanelOpen, isBlocksPanelOpen]);

  const handleToggleThemePanel = () => {
    setIsThemePanelOpen(!isThemePanelOpen);
    setIsBlocksPanelOpen(false); // Close blocks panel if open
  };

  const handleToggleBlocksPanel = () => {
    setIsBlocksPanelOpen(!isBlocksPanelOpen);
    setIsThemePanelOpen(false); // Close theme panel if open
  };

  return (
    <>
      {/* Floating Sidebar Buttons */}
      <div
        data-floating-sidebar
        className="fixed right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2"
      >
        <div
          className="p-2 rounded-lg backdrop-blur-sm"
          style={{
            backgroundColor: isDark
              ? "rgba(15,23,42,0.9)"
              : "rgba(255,255,255,0.92)",
            border: `1px solid ${borderColor}`,
          }}
        >
          <Button
            onClick={handleToggleBlocksPanel}
            variant={isBlocksPanelOpen ? "default" : "ghost"}
            size="icon"
            className="h-10 w-10"
            style={{
              backgroundColor: isBlocksPanelOpen
                ? accent
                : "transparent",
              color: isBlocksPanelOpen
                ? "white"
                : textPrimary,
            }}
            onMouseEnter={(e) => {
              if (!isBlocksPanelOpen) {
                e.currentTarget.style.backgroundColor = isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(37,99,235,0.1)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isBlocksPanelOpen) {
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
            title="Blocks"
          >
            <IconBlocks
              className="size-5"
              style={{
                color: isBlocksPanelOpen ? "white" : textPrimary,
              }}
            />
          </Button>
        </div>
        <div
          className="p-2 rounded-lg backdrop-blur-sm"
          style={{
            backgroundColor: isDark
              ? "rgba(15,23,42,0.9)"
              : "rgba(255,255,255,0.92)",
            border: `1px solid ${borderColor}`,
          }}
        >
          <Button
            onClick={handleToggleThemePanel}
            variant={isThemePanelOpen ? "default" : "ghost"}
            size="icon"
            className="h-10 w-10"
            style={{
              backgroundColor: isThemePanelOpen
                ? accent
                : "transparent",
              color: isThemePanelOpen
                ? "white"
                : textPrimary,
            }}
            onMouseEnter={(e) => {
              if (!isThemePanelOpen) {
                e.currentTarget.style.backgroundColor = isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(37,99,235,0.1)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isThemePanelOpen) {
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
            title="Themes"
          >
            <IconPalette
              className="size-5"
              style={{
                color: isThemePanelOpen ? "white" : textPrimary,
              }}
            />
          </Button>
        </div>
      </div>

      {/* Blocks Panel - positioned relative to floating button */}
      {isBlocksPanelOpen && (
        <div
          data-blocks-panel
          className="fixed right-20 top-1/2 -translate-y-1/2 z-50"
        >
          <BlocksPanel
            isOpen={isBlocksPanelOpen}
            onClose={() => setIsBlocksPanelOpen(false)}
          />
        </div>
      )}

      {/* Theme Panel - positioned relative to floating button */}
      {isThemePanelOpen && (
        <div
          data-theme-panel
          className="fixed right-20 top-1/2 -translate-y-1/2 z-50"
        >
          <ThemePanel
            isOpen={isThemePanelOpen}
            onClose={() => setIsThemePanelOpen(false)}
          />
        </div>
      )}
    </>
  );
};

