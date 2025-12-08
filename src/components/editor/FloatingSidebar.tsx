import React, { useState } from "react";
import { SmartLayoutPanel } from "./SmartLayoutPanel";
import { ThemePanel } from "./ThemePanel";
import { SmartLayoutIcon } from "./icons/layout-icons";

interface FloatingSidebarProps {
  isLayoutPanelOpen: boolean;
  onToggleLayoutPanel: () => void;
}

export const FloatingSidebar: React.FC<FloatingSidebarProps> = ({
  isLayoutPanelOpen,
  onToggleLayoutPanel,
}) => {
  const [isThemePanelOpen, setIsThemePanelOpen] = useState(false);

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
      <div className="relative">
        <SmartLayoutPanel isOpen={isLayoutPanelOpen} onClose={handleToggleLayoutPanel} />
        <ThemePanel isOpen={isThemePanelOpen} onClose={handleToggleThemePanel} />
        <div className="flex flex-col gap-2 p-2 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/80">
          <button
            onClick={handleToggleLayoutPanel}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
              isLayoutPanelOpen
                ? "bg-blue-500 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
            }`}
            title="Smart Layout"
          >
            <SmartLayoutIcon />
          </button>
          <button
            onClick={handleToggleThemePanel}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
              isThemePanelOpen
                ? "bg-blue-500 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
            }`}
            title="Theme Settings"
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
            >
              <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
              <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
              <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
              <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.434-.69-.434-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

