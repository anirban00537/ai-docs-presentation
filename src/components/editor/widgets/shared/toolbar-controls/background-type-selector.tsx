"use client";

import React from "react";
import { Popover } from "@headlessui/react";
import { ChevronDown, Sparkles } from "lucide-react";
import { PopoverPanelPortal } from "@/components/editor/background/popover-panel-portal";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import { selectGlobalTheme } from "@/store/slices/slidesSlice";
import { BACKGROUND_TYPE_OPTIONS } from "./constants";
import type { BackgroundTypeConfig } from "./types";

interface BackgroundTypeSelectorProps {
  config: BackgroundTypeConfig;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
}

export const BackgroundTypeSelector: React.FC<BackgroundTypeSelectorProps> = ({
  config,
  buttonRef: externalButtonRef,
}) => {
  const internalButtonRef = React.useRef<HTMLButtonElement>(null);
  const buttonRef = externalButtonRef || internalButtonRef;
  const globalTheme = useAppSelector(selectGlobalTheme);
  const isDarkTheme = globalTheme?.tone === "dark";

  const currentLabel =
    BACKGROUND_TYPE_OPTIONS.find((option) => option.value === config.value)
      ?.label ?? "Solid";

  return (
    <Popover>
      {({ open }) => (
        <>
          <Popover.Button
            ref={buttonRef}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all duration-300 ease-out",
              isDarkTheme
                ? "bg-white/5 text-white/80 hover:bg-white/10"
                : "bg-black/5 text-muted-foreground/80 hover:bg-black/10",
              open && (isDarkTheme ? "bg-white/10 text-white/90" : "bg-black/10 text-foreground")
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="uppercase tracking-wide text-[10px]">
              {currentLabel}
            </span>
            <ChevronDown className="h-3 w-3" />
          </Popover.Button>
          {open && (
            <PopoverPanelPortal buttonRef={buttonRef}>
              <div
                className={cn(
                  "flex flex-col gap-1.5 p-3 backdrop-blur-2xl rounded-xl shadow-2xl border min-w-[200px]",
                  "animate-in fade-in zoom-in-95 duration-300 ease-out",
                  isDarkTheme
                    ? "bg-black border-white/10"
                    : "bg-white/95 border-white/20"
                )}
              >
                {BACKGROUND_TYPE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={cn(
                      "flex flex-col rounded-lg px-3 py-2 text-xs transition-all duration-300 ease-out text-left",
                      option.value === config.value
                        ? isDarkTheme
                          ? "bg-white/10 text-white/90 font-semibold"
                          : "bg-black/5 text-foreground font-semibold"
                        : isDarkTheme
                        ? "text-white/70 hover:bg-white/5 hover:text-white/90"
                        : "text-muted-foreground hover:bg-black/5 hover:text-foreground"
                    )}
                    onClick={() => config.onChange(option.value)}
                  >
                    <span>{option.label}</span>
                    <span className="text-[10px] opacity-70">
                      {option.description}
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

