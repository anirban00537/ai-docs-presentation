"use client";

import React from "react";
import { Popover } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { PopoverPanelPortal } from "@/components/editor/background/popover-panel-portal";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import { selectGlobalTheme } from "@/store/slices/slidesSlice";
import { Input } from "@/components/ui/input";
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
  const globalTheme = useAppSelector(selectGlobalTheme);
  const isDarkTheme = globalTheme?.tone === "dark";
  const [customValue, setCustomValue] = React.useState<string>(
    config.value.toString()
  );
  const inputRef = React.useRef<HTMLInputElement>(null);

  const options = config.options || FONT_SIZE_OPTIONS;
  const isCustomValue = !options.some(
    (option) => option.value === config.value
  );
  const currentLabel = isCustomValue
    ? `${config.value}px`
    : options.find((option) => option.value === config.value)?.label ??
      `${config.value}px`;

  // Update custom value when config value changes
  React.useEffect(() => {
    if (isCustomValue) {
      setCustomValue(config.value.toString());
    }
  }, [config.value, isCustomValue]);

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.trim();
    setCustomValue(rawValue);

    if (rawValue === "") {
      return;
    }

    const numValue = Number(rawValue);
    if (
      Number.isFinite(numValue) &&
      numValue >= 8 &&
      numValue <= 300 &&
      numValue !== config.value
    ) {
      const roundedValue = Math.round(numValue);
      config.onChange(roundedValue);
    }
  };

  const handleCustomInputBlur = () => {
    const numValue = Number(customValue);
    if (!Number.isFinite(numValue) || numValue < 8 || numValue > 300) {
      // Reset to current config value if invalid
      setCustomValue(config.value.toString());
    } else {
      const roundedValue = Math.round(numValue);
      if (roundedValue !== config.value) {
        config.onChange(roundedValue);
      } else {
        setCustomValue(roundedValue.toString());
      }
    }
  };

  const handleCustomInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      inputRef.current?.blur();
    }
  };

  return (
    <Popover>
      {({ open }) => (
        <>
          <Popover.Button
            ref={buttonRef}
            className={cn(
              "flex items-center gap-0.5 rounded-md px-2 py-1 text-xs font-medium transition-all duration-200 ease-out",
              isDarkTheme
                ? "bg-white/5 text-white/80 hover:bg-white/10"
                : "bg-black/5 text-foreground/80 hover:bg-black/10",
              open &&
                (isDarkTheme ? "bg-white/10 text-white/90" : "bg-black/10 text-foreground")
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
              <div
                className={cn(
                  "flex flex-col gap-0.5 p-1.5 backdrop-blur-2xl rounded-lg shadow-xl border min-w-[160px]",
                  "animate-in fade-in zoom-in-95 duration-200 ease-out",
                  isDarkTheme
                    ? "bg-black border-white/10"
                    : "bg-white/95 border-white/20"
                )}
              >
                {options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={cn(
                      "flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-all duration-200 ease-out",
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
                    <span className="text-[10px] uppercase">
                      {option.value}px
                    </span>
                  </button>
                ))}
                <div
                  className={cn(
                    "border-t pt-2 mt-1",
                    isDarkTheme ? "border-white/10" : "border-white/20"
                  )}
                >
                  <div className="px-1 mb-1.5">
                    <label
                      className={cn(
                        "text-[10px] uppercase tracking-wide font-medium",
                        isDarkTheme ? "text-white/70" : "text-muted-foreground"
                      )}
                    >
                      Custom Size
                    </label>
                  </div>
                  <div className="flex items-center gap-2 px-1">
                    <Input
                      ref={inputRef}
                      type="number"
                      min={8}
                      max={300}
                      value={customValue}
                      onChange={handleCustomInputChange}
                      onBlur={handleCustomInputBlur}
                      onKeyDown={handleCustomInputKeyDown}
                      className={cn(
                        "h-8 text-xs text-center font-mono focus-visible:ring-1 focus-visible:ring-primary/50",
                        isDarkTheme
                          ? "border-white/10 bg-white/5 text-white/90"
                          : "border-white/30 text-foreground"
                      )}
                      placeholder="Custom"
                      onClick={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                    />
                    <span
                      className={cn(
                        "text-[10px] uppercase",
                        isDarkTheme ? "text-white/70" : "text-muted-foreground"
                      )}
                    >
                      px
                    </span>
                  </div>
                </div>
              </div>
            </PopoverPanelPortal>
          )}
        </>
      )}
    </Popover>
  );
};
