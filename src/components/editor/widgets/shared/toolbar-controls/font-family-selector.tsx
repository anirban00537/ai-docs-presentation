"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import { selectGlobalTheme } from "@/store/slices/slidesSlice";
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

  const globalTheme = useAppSelector(selectGlobalTheme);
  const isDarkTheme = globalTheme?.tone === "dark";
  const currentFontLabel =
    GOOGLE_FONTS.find((font) => font.value === config.value)?.label ?? "Poppins";

  return (
    <div className="relative flex items-center">
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        className={cn(
          "flex items-center gap-2 rounded-full border border-transparent px-3 py-1.5 text-xs",
          "transition-all duration-300 ease-out w-[110px] justify-between group",
          isDarkTheme
            ? "bg-white/5 hover:bg-white/10"
            : "bg-black/5 hover:bg-black/10"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span
          className={cn(
            "text-[11px] font-medium truncate transition-colors duration-300 ease-out",
            isDarkTheme
              ? "text-white/80 group-hover:text-white/90"
              : "text-foreground/80 group-hover:text-foreground"
          )}
        >
          {currentFontLabel}
        </span>
        <ChevronDown
          className={cn(
            "h-3 w-3 transition-transform duration-300 ease-out group-data-[state=open]:rotate-180",
            isDarkTheme ? "text-white/70" : "text-muted-foreground"
          )}
        />
      </Button>
      {isOpen && (
        <div
          ref={menuRef}
          className={cn(
            "absolute left-0 top-full mt-2 z-50 min-w-[200px] max-h-[300px] overflow-y-auto rounded-xl border backdrop-blur-xl p-1.5",
            "animate-in fade-in zoom-in-95 duration-300 ease-out",
            "custom-scrollbar",
            isDarkTheme
              ? "bg-black border-white/10 custom-scrollbar-dark shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]"
              : "bg-white/90 border-white/20 custom-scrollbar-light shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)]"
          )}
        >
          <div className="flex flex-col gap-0.5">
            {GOOGLE_FONTS.map((font) => (
              <button
                key={font.value}
                type="button"
                className={cn(
                  "flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all duration-300 ease-out",
                  config.value === font.value
                    ? isDarkTheme
                      ? "bg-white/10 text-white/90 font-medium"
                      : "bg-black/5 text-foreground font-medium"
                    : isDarkTheme
                    ? "text-white/70 hover:bg-white/5 hover:text-white/90"
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
                  <span className={cn("text-xs", isDarkTheme ? "text-primary" : "text-blue-600")}>
                    ●
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

