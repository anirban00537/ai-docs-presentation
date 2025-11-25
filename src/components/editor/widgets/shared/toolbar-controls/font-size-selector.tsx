"use client";

import React from "react";
import { Popover } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { PopoverPanelPortal } from "@/components/editor/background/popover-panel-portal";
import { cn } from "@/lib/utils";
import { FONT_SIZE_OPTIONS } from "./constants";
import type { FontSizeConfig } from "./types";

interface FontSizeSelectorProps {
  config: FontSizeConfig;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
  label?: string;
}

export const FontSizeSelector: React.FC<FontSizeSelectorProps> = ({
  config,
  buttonRef: externalButtonRef,
  label,
}) => {
  const internalButtonRef = React.useRef<HTMLButtonElement>(null);
  const buttonRef = externalButtonRef || internalButtonRef;

  const options = config.options || FONT_SIZE_OPTIONS;
  const currentLabel =
    options.find((option) => option.value === config.value)?.label ??
    `${config.value}px`;

  return (
    <Popover>
      {({ open }) => (
        <>
          <Popover.Button
            ref={buttonRef}
            className={cn(
              "flex items-center gap-1 rounded-full bg-black/5 px-3 py-1.5 text-xs font-medium text-foreground/80 transition-all hover:bg-black/10",
              open && "bg-black/10 text-foreground"
            )}
          >
            {label && (
              <span className="uppercase tracking-wide text-[10px]">
                {label}
              </span>
            )}
            <span className="uppercase tracking-wide text-[10px]">
              {currentLabel}
            </span>
            <ChevronDown className="h-3 w-3" />
          </Popover.Button>
          {open && (
            <PopoverPanelPortal buttonRef={buttonRef}>
              <div className="flex flex-col gap-1 p-2 bg-white/95 backdrop-blur-2xl rounded-xl shadow-2xl border border-white/20 min-w-[160px] animate-in fade-in zoom-in-95 duration-150">
                {options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={cn(
                      "flex items-center justify-between rounded-lg px-3 py-2 text-xs transition-all",
                      option.value === config.value
                        ? "bg-black/5 text-foreground font-semibold"
                        : "text-muted-foreground hover:bg-black/5 hover:text-foreground"
                    )}
                    onClick={() => config.onChange(option.value)}
                  >
                    <span>{option.label}</span>
                    <span className="text-[10px] uppercase">
                      {option.value}px
                    </span>
                  </button>
                ))}
              </div>
            </PopoverPanelPortal>
          )}
        </>
      )}
    </Popover>
  );
};
