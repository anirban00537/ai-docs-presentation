"use client";

import React from "react";
import { Popover } from "@headlessui/react";
import { HexColorPicker } from "react-colorful";
import { X } from "lucide-react";
import { PopoverPanelPortal } from "./popover-panel-portal";

interface GradientColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  onRemove: () => void;
  showRemove: boolean;
}

export function GradientColorPicker({
  color,
  onChange,
  onRemove,
  showRemove,
}: GradientColorPickerProps) {
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  return (
    <div className="relative overflow-visible">
      <Popover>
        {({ open }) => (
          <>
            <Popover.Button
              ref={buttonRef}
              className="relative w-10 h-10 rounded-full cursor-pointer border-2 border-border/60 hover:border-primary/50 transition-all hover:scale-110"
              style={{ backgroundColor: color }}
            >
              <div
                className="w-full h-full rounded-full"
                style={{ backgroundColor: color }}
              />
              {showRemove && (
                <span
                  className="absolute -top-1 -right-1 bg-destructive rounded-full p-0.5 cursor-pointer hover:bg-destructive/80 transition-colors z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                >
                  <X className="text-white" size={12} />
                </span>
              )}
            </Popover.Button>
            {open && (
              <PopoverPanelPortal buttonRef={buttonRef}>
                <HexColorPicker color={color} onChange={onChange} />
              </PopoverPanelPortal>
            )}
          </>
        )}
      </Popover>
    </div>
  );
}

