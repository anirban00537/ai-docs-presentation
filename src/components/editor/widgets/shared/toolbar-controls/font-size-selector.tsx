"use client";

import React from "react";
import { Popover } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { PopoverPanelPortal } from "@/components/editor/background/popover-panel-portal";
import { cn } from "@/lib/utils";
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
              <div className="flex flex-col gap-1 p-2 bg-white/95 backdrop-blur-2xl rounded-xl shadow-2xl border border-white/20 min-w-[180px] animate-in fade-in zoom-in-95 duration-150">
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
                <div className="border-t border-white/20 pt-2 mt-1">
                  <div className="px-1 mb-1.5">
                    <label className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
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
                      className="h-8 text-xs text-center font-mono border-white/30 focus-visible:ring-1 focus-visible:ring-primary/50"
                      placeholder="Custom"
                      onClick={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                    />
                    <span className="text-[10px] text-muted-foreground uppercase">
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
