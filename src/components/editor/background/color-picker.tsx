"use client";

import React from "react";
import { Popover } from "@headlessui/react";
import { HexColorPicker } from "react-colorful";
import { X } from "lucide-react";
import { PopoverPanelPortal } from "./popover-panel-portal";
import { Input } from "@/components/ui/input";
import { useAppSelector } from "@/store/hooks";
import { selectGlobalTheme } from "@/store/slices/slidesSlice";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  onRemove: () => void;
  showRemove: boolean;
}

export function ColorPicker({
  color,
  onChange,
  onRemove,
  showRemove,
}: ColorPickerProps) {
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const globalTheme = useAppSelector(selectGlobalTheme);
  const isDarkTheme = globalTheme?.tone === "dark";
  
  return (
    <div className="relative overflow-visible group/picker">
      <Popover>
        {({ open }) => (
          <>
            <Popover.Button
              ref={buttonRef}
              className={cn(
                "relative w-10 h-10 rounded-full cursor-pointer border-[3px] ring-1 shadow-sm hover:scale-110 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50",
                isDarkTheme
                  ? "border-black ring-white/10"
                  : "border-background ring-border/30"
              )}
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
                <div
                  className={cn(
                    "flex flex-col gap-3 p-3 rounded-xl shadow-2xl border animate-in fade-in zoom-in-95 duration-200",
                    isDarkTheme
                      ? "bg-black border-white/10"
                      : "bg-popover border-border/50"
                  )}
                >
                  <HexColorPicker color={color} onChange={onChange} className="!w-full !h-40" />
                  <div
                    className={cn(
                      "flex items-center gap-2 p-1 rounded-md border",
                      isDarkTheme
                        ? "bg-white/5 border-white/10"
                        : "bg-muted/50 border-border/50"
                    )}
                  >
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full border shadow-sm shrink-0",
                        isDarkTheme ? "border-white/10" : "border-border/20"
                      )}
                      style={{ backgroundColor: color }}
                    />
                    <Input
                      className={cn(
                        "h-7 text-xs font-mono border-none bg-transparent focus-visible:ring-0 px-1 uppercase w-20",
                        isDarkTheme ? "text-white/90" : "text-foreground"
                      )}
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
