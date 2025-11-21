"use client";

import React from "react";
import { Popover } from "@headlessui/react";
import { HexColorPicker } from "react-colorful";
import { X } from "lucide-react";
import { PopoverPanelPortal } from "./popover-panel-portal";
import { Input } from "@/components/ui/input";

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
    <div className="relative overflow-visible group/picker">
      <Popover>
        {({ open }) => (
          <>
            <Popover.Button
              ref={buttonRef}
              className="relative w-10 h-10 rounded-full cursor-pointer border-[3px] border-background ring-1 ring-border/30 shadow-sm hover:scale-110 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
              style={{ backgroundColor: color }}
            >
              {showRemove && (
                <span
                  className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 cursor-pointer opacity-0 group-hover/picker:opacity-100 hover:bg-destructive/90 transition-all shadow-sm scale-75 hover:scale-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                >
                  <X size={12} strokeWidth={3} />
                </span>
              )}
            </Popover.Button>
            {open && (
              <PopoverPanelPortal buttonRef={buttonRef}>
                <div className="flex flex-col gap-3 p-3 bg-popover rounded-xl shadow-2xl border border-border/50 animate-in fade-in zoom-in-95 duration-200">
                  <HexColorPicker color={color} onChange={onChange} className="!w-full !h-40" />
                  <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-md border border-border/50">
                    <div 
                      className="w-6 h-6 rounded-full border border-border/20 shadow-sm shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <Input
                      className="h-7 text-xs font-mono border-none bg-transparent focus-visible:ring-0 px-1 uppercase w-20"
                      value={color}
                      onChange={(e) => onChange(e.target.value)}
                      placeholder="#000000"
                    />
                  </div>
                </div>
              </PopoverPanelPortal>
            )}
          </>
        )}
      </Popover>
    </div>
  );
}
