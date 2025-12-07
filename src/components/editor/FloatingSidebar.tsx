import React from "react";
import { SmartLayoutPanel } from "./SmartLayoutPanel";
import { SmartLayoutIcon } from "./icons/layout-icons";

interface FloatingSidebarProps {
  isLayoutPanelOpen: boolean;
  onToggleLayoutPanel: () => void;
}

export const FloatingSidebar: React.FC<FloatingSidebarProps> = ({
  isLayoutPanelOpen,
  onToggleLayoutPanel,
}) => {
  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40">
      <div className="relative">
        <SmartLayoutPanel isOpen={isLayoutPanelOpen} onClose={onToggleLayoutPanel} />
        <div className="flex flex-col gap-2 p-2 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/80">
          <button
            onClick={onToggleLayoutPanel}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
              isLayoutPanelOpen
                ? "bg-blue-500 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
            }`}
            title="Smart Layout"
          >
            <SmartLayoutIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

