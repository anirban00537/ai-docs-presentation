"use client";

import React from "react";
import { Popover } from "@headlessui/react";
import { HexColorPicker } from "react-colorful";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { PopoverPanelPortal } from "@/components/editor/background/popover-panel-portal";
import { cn } from "@/lib/utils";
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

  return (
    <Popover>
      {({ open }) => (
        <>
          <Popover.Button
            ref={buttonRef}
            className="relative w-6 h-6 rounded-full cursor-pointer ring-1 ring-black/5 shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition-all hover:scale-110 hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] focus:outline-none active:scale-95"
            style={{ backgroundColor: config.color }}
          >
            <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/5" />
            {config.showReset &&
              config.color !== config.resetValue &&
              config.resetValue && (
                <span
                  className="absolute -top-1 -right-1 flex items-center justify-center w-3.5 h-3.5 bg-neutral-900 text-white rounded-full cursor-pointer opacity-0 group-hover/picker:opacity-100 transition-all shadow-sm scale-75 hover:scale-100"
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
              <div className="flex flex-col gap-3 p-3 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/20 animate-in fade-in zoom-in-95 duration-200 min-w-[240px]">
                <div className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider px-1">
                  {config.label || "Color"}
                </div>
                <HexColorPicker
                  color={config.color}
                  onChange={config.onChange}
                  className="w-full! h-32! rounded-xl!"
                />
                <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-lg border border-black/5">
                  <div
                    className="w-6 h-6 rounded-full border border-black/10 shadow-sm shrink-0"
                    style={{
                      backgroundColor: config.color,
                    }}
                  />
                  <Input
                    className="h-7 text-xs font-mono border-none bg-transparent focus-visible:ring-0 px-1 uppercase w-full text-muted-foreground"
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

