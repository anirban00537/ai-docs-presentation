import React, { useState } from "react";
import { SmartLayoutPanel } from "./SmartLayoutPanel";
import { ThemePanel } from "./ThemePanel";
import { SmartLayoutIcon } from "./icons/layout-icons";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/slidesSlice";

interface FloatingSidebarProps {
  isLayoutPanelOpen: boolean;
  onToggleLayoutPanel: () => void;
}

export const FloatingSidebar: React.FC<FloatingSidebarProps> = ({
  isLayoutPanelOpen,
  onToggleLayoutPanel,
}) => {
  const [isThemePanelOpen, setIsThemePanelOpen] = useState(false);
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;

  const handleToggleThemePanel = () => {
    setIsThemePanelOpen(!isThemePanelOpen);
    if (isLayoutPanelOpen) {
      onToggleLayoutPanel();
    }
  };

  const handleToggleLayoutPanel = () => {
    onToggleLayoutPanel();
    if (isThemePanelOpen) {
      setIsThemePanelOpen(false);
    }
  };

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40">
      <Card
        className="flex flex-col gap-2 p-2 shadow-lg relative border"
        style={{
          backgroundColor: theme.cardBackground,
          borderColor: theme.primary + "20",
          color: theme.bodyColor,
        }}
      >
        <SmartLayoutPanel
          isOpen={isLayoutPanelOpen}
          onClose={handleToggleLayoutPanel}
        />
        <ThemePanel
          isOpen={isThemePanelOpen}
          onClose={handleToggleThemePanel}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isLayoutPanelOpen ? "default" : "ghost"}
              size="icon"
              onClick={handleToggleLayoutPanel}
              className="h-10 w-10"
              style={
                isLayoutPanelOpen
                  ? {
                      backgroundColor: theme.primary,
                      color: "white",
                    }
                  : undefined
              }
            >
              <SmartLayoutIcon
                className={isLayoutPanelOpen ? "text-white" : ""}
                style={isLayoutPanelOpen ? { color: "white" } : undefined}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent
            side="left"
            style={{
              backgroundColor: theme.cardBackground,
              color: theme.bodyColor,
              borderColor: theme.primary + "20",
            }}
          >
            <p>Smart Layout</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isThemePanelOpen ? "default" : "ghost"}
              size="icon"
              onClick={handleToggleThemePanel}
              className="h-10 w-10"
              style={
                isThemePanelOpen
                  ? {
                      backgroundColor: theme.primary,
                      color: "white",
                    }
                  : undefined
              }
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={isThemePanelOpen ? "text-white" : ""}
                style={isThemePanelOpen ? { color: "white" } : undefined}
              >
                <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
                <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.434-.69-.434-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
              </svg>
            </Button>
          </TooltipTrigger>
          <TooltipContent
            side="left"
            style={{
              backgroundColor: theme.cardBackground,
              color: theme.bodyColor,
              borderColor: theme.primary + "20",
            }}
          >
            <p>Theme Settings</p>
          </TooltipContent>
        </Tooltip>
      </Card>
    </div>
  );
};
