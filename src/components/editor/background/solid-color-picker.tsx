"use client";

import React from "react";
import { Popover } from "@headlessui/react";
import { HexColorPicker } from "react-colorful";
import { PopoverPanelPortal } from "./popover-panel-portal";

interface SolidColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export function SolidColorPicker({
  color,
  onChange,
}: SolidColorPickerProps) {
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

