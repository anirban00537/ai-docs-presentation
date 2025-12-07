"use client";

import React from "react";
import { Popover } from "@headlessui/react";
import { HexColorPicker } from "react-colorful";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { PopoverPanelPortal } from "@/components/editor/background/popover-panel-portal";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import { selectGlobalTheme } from "@/store/slices/slidesSlice";
import type { ColorPickerConfig } from "./types";

interface ColorPickerProps {
  config: ColorPickerConfig;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  config,
  buttonRef: externalButtonRef,
}) => {
  const internalButtonRef = React.useRef<HTMLButtonElement>(null);
  const buttonRef = externalButtonRef || internalButtonRef;
  const globalTheme = useAppSelector(selectGlobalTheme);
  const isDarkTheme = globalTheme?.tone === "dark";

  return (
    <Popover>
      {({ open }) => (
        <>
          <Popover.Button
            ref={buttonRef}
            className={cn(
              "relative w-5 h-5 rounded-md cursor-pointer ring-1 shadow-[0_1px_3px_rgba(0,0,0,0.08)]",
              "transition-all duration-200 ease-out hover:scale-[1.05] hover:shadow-[0_2px_8px_rgba(0,0,0,0.12)]",
              "focus:outline-none active:scale-[0.97]",
              isDarkTheme ? "ring-white/10" : "ring-black/5"
            )}
            style={{ backgroundColor: config.color }}
          >
            <div
              className={cn(
                "absolute inset-0 rounded-md ring-1 ring-inset",
                isDarkTheme ? "ring-white/10" : "ring-black/5"
              )}
            />
            {config.showReset &&
              config.color !== config.resetValue &&
              config.resetValue && (
                <span
                  className="absolute -top-1 -right-1 flex items-center justify-center w-3.5 h-3.5 bg-destructive text-destructive-foreground rounded-full cursor-pointer opacity-0 group-hover/picker:opacity-100 transition-all shadow-sm scale-75 hover:scale-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    config.onChange(config.resetValue || "#ffffff");
                  }}
                >
                  <X size={8} strokeWidth={3} />
                </span>
              )}
          </Popover.Button>
          {open && (
            <PopoverPanelPortal buttonRef={buttonRef}>
              <div
                className={cn(
                  "flex flex-col gap-2.5 p-2.5 backdrop-blur-2xl rounded-xl shadow-xl border",
                  "animate-in fade-in zoom-in-95 duration-200 ease-out min-w-[220px]",
                  isDarkTheme
                    ? "bg-black border-white/10"
                    : "bg-white/95 border-white/20"
                )}
              >
                <div
                  className={cn(
                    "text-[11px] font-semibold uppercase tracking-wider px-1",
                    isDarkTheme ? "text-white/70" : "text-muted-foreground/80"
                  )}
                >
                  {config.label || "Color"}
                </div>
                <HexColorPicker
                  color={config.color}
                  onChange={config.onChange}
                  className="!w-full !h-32 !rounded-xl"
                />
                <div
                  className={cn(
                    "flex items-center gap-2 p-1.5 rounded-lg border",
                    isDarkTheme
                      ? "bg-white/5 border-white/10"
                      : "bg-muted/30 border-black/5"
                  )}
                >
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full border shadow-sm shrink-0",
                      isDarkTheme ? "border-white/10" : "border-black/10"
                    )}
                    style={{
                      backgroundColor: config.color,
                    }}
                  />
                  <Input
                    className={cn(
                      "h-7 text-xs font-mono border-none bg-transparent focus-visible:ring-0 px-1 uppercase w-full",
                      isDarkTheme ? "text-white/90" : "text-muted-foreground"
                    )}
                    value={config.color}
                    onChange={(e) => config.onChange(e.target.value)}
                    placeholder="#000000"
                  />
                </div>
              </div>
            </PopoverPanelPortal>
          )}
        </>
      )}
    </Popover>
  );
};

