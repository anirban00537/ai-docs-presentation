import React from "react";
import { DraggableLayoutOption } from "./DraggableLayoutOption";
import { TwoColumnIcon, ThreeColumnIcon, FourColumnIcon } from "./icons/layout-icons";

interface SmartLayoutPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmartLayoutPanel: React.FC<SmartLayoutPanelProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute right-14 top-0 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Smart Layout</h3>
        <button
          onClick={onClose}
          className="w-5 h-5 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
        >
          ×
        </button>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Drag a layout to add a new row
      </p>
      <div className="flex flex-col gap-3">
        <DraggableLayoutOption
          id="layout-2-col"
          columnCount={2}
          icon={<TwoColumnIcon />}
          label="2 Columns"
        />
        <DraggableLayoutOption
          id="layout-3-col"
          columnCount={3}
          icon={<ThreeColumnIcon />}
          label="3 Columns"
        />
        <DraggableLayoutOption
          id="layout-4-col"
          columnCount={4}
          icon={<FourColumnIcon />}
          label="4 Columns"
        />
      </div>
    </div>
  );
};

