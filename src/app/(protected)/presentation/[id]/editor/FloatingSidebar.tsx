import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { IconPalette, IconX } from "@tabler/icons-react";
import { ThemePanel } from "./ThemePanel";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/slidesSlice";

interface FloatingSidebarProps {
  presentationId: string;
}

export const FloatingSidebar: React.FC<FloatingSidebarProps> = ({
  presentationId,
}) => {
  const [isThemePanelOpen, setIsThemePanelOpen] = useState(false);
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const isDark = theme.themeType === "dark";
  const accent = isDark ? "#60a5fa" : "#2563eb";
  const textPrimary = isDark ? "#e5e7eb" : "#0f172a";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb";

  // Close panel when clicking outside
  useEffect(() => {
    if (isThemePanelOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (
          !target.closest('[data-floating-sidebar]') &&
          !target.closest('[data-theme-panel]')
        ) {
          setIsThemePanelOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isThemePanelOpen]);

  const handleToggleThemePanel = () => {
    setIsThemePanelOpen(!isThemePanelOpen);
  };

  return (
    <>
      {/* Floating Sidebar Button */}
      <div
        data-floating-sidebar
        className="fixed right-6 top-1/2 -translate-y-1/2 z-40"
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

