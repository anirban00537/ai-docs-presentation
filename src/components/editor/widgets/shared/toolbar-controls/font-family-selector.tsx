"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { GOOGLE_FONTS } from "./constants";
import type { FontFamilyConfig } from "./types";

interface FontFamilySelectorProps {
  config: FontFamilyConfig;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
  menuRef?: React.RefObject<HTMLDivElement | null>;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const FontFamilySelector: React.FC<FontFamilySelectorProps> = ({
  config,
  buttonRef: externalButtonRef,
  menuRef: externalMenuRef,
  isOpen: controlledIsOpen,
  onOpenChange,
}) => {
  const internalButtonRef = React.useRef<HTMLButtonElement>(null);
  const internalMenuRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = externalButtonRef || internalButtonRef;
  const menuRef = externalMenuRef || internalMenuRef;

  const [internalIsOpen, setInternalIsOpen] = React.useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = onOpenChange || setInternalIsOpen;

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, menuRef, buttonRef, setIsOpen]);

  const currentFontLabel =
    GOOGLE_FONTS.find((font) => font.value === config.value)?.label ?? "Poppins";

  return (
    <div className="relative flex items-center">
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        className="flex items-center gap-2 rounded-full bg-black/5 border border-transparent px-3 py-1.5 text-xs hover:bg-black/10 transition-all w-[110px] justify-between group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-[11px] font-medium text-foreground/80 truncate group-hover:text-foreground">
          {currentFontLabel}
        </span>
        <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </Button>
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute left-0 top-full mt-2 z-50 min-w-[200px] max-h-[300px] overflow-y-auto rounded-xl border border-white/20 bg-white/90 backdrop-blur-xl p-1.5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex flex-col gap-0.5">
            {GOOGLE_FONTS.map((font) => (
              <button
                key={font.value}
                type="button"
                className={cn(
                  "flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all duration-200",
                  config.value === font.value
                    ? "bg-black/5 text-foreground font-medium"
                    : "text-muted-foreground hover:bg-black/5 hover:text-foreground"
                )}
                style={{ fontFamily: font.style }}
                onClick={() => {
                  config.onChange(font.value);
                  setIsOpen(false);
                }}
              >
                <span>{font.label}</span>
                {config.value === font.value && (
                  <span className="text-blue-600 text-xs">●</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

