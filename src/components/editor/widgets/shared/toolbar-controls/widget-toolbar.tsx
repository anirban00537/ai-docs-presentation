"use client";

import React from "react";
import { ToolbarPortal } from "@/components/editor/toolbar-portal";
import { ColorPicker } from "./color-picker";
import { BackgroundTypeSelector } from "./background-type-selector";
import { FontFamilySelector } from "./font-family-selector";
import { FontSizeSelector } from "./font-size-selector";
import { AlignmentControls } from "./alignment-controls";
import { ToolbarSeparator } from "./toolbar-separator";
import { useAppSelector } from "@/store/hooks";
import { selectGlobalTheme } from "@/store/slices/slidesSlice";
import { cn } from "@/lib/utils";
import type {
  WidgetToolbarProps,
  ToolbarControlConfig,
  ColorPickerConfig,
  BackgroundTypeConfig,
  FontFamilyConfig,
  FontSizeConfig,
  AlignmentConfig,
} from "./types";

export const WidgetToolbar: React.FC<WidgetToolbarProps> = ({
  widgetRef,
  viewport,
  containerRef,
  isEditing,
  activeField,
  controls,
  customControls,
  toolbarSelector,
}) => {
  // Refs for font menu management
  const fontButtonRef = React.useRef<HTMLButtonElement>(null);
  const fontMenuRef = React.useRef<HTMLDivElement>(null);
  const [fontMenuOpen, setFontMenuOpen] = React.useState(false);

  // Close font menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        fontMenuOpen &&
        fontMenuRef.current &&
        !fontMenuRef.current.contains(target) &&
        fontButtonRef.current &&
        !fontButtonRef.current.contains(target)
      ) {
        setFontMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [fontMenuOpen]);

  const renderControl = (control: ToolbarControlConfig, index: number) => {
    // Check if control should be shown
    if (control.showWhen && !control.showWhen(activeField)) {
      return null;
    }

    // Render separator
    if (control.type === "separator") {
      return <ToolbarSeparator key={`separator-${index}`} />;
    }

    // Render custom control
    if (control.type === "custom" && control.customRender) {
      return (
        <React.Fragment key={`custom-${index}`}>
          {control.customRender(activeField)}
        </React.Fragment>
      );
    }

    // Render color picker
    if (control.type === "color-picker" && control.config) {
      const config = control.config as ColorPickerConfig;
      return <ColorPicker key={`color-picker-${index}`} config={config} />;
    }

    // Render background type selector
    if (control.type === "background-type" && control.config) {
      const config = control.config as BackgroundTypeConfig;
      return (
        <BackgroundTypeSelector key={`bg-type-${index}`} config={config} />
      );
    }

    // Render font family selector
    if (control.type === "font-family" && control.config) {
      const config = control.config as FontFamilyConfig;
      return (
        <FontFamilySelector
          key={`font-family-${index}`}
          config={config}
          buttonRef={fontButtonRef}
          menuRef={fontMenuRef}
          isOpen={fontMenuOpen}
          onOpenChange={setFontMenuOpen}
        />
      );
    }

    // Render font size selector
    if (control.type === "font-size" && control.config) {
      const config = control.config as FontSizeConfig;
      return <FontSizeSelector key={`font-size-${index}`} config={config} />;
    }

    // Render alignment controls
    if (control.type === "alignment" && control.config) {
      const config = control.config as AlignmentConfig;
      return <AlignmentControls key={`alignment-${index}`} config={config} />;
    }

    return null;
  };

  const globalTheme = useAppSelector(selectGlobalTheme);
  const isDarkTheme = globalTheme?.tone === "dark";

  return (
    <ToolbarPortal
      widgetRef={widgetRef}
      viewport={viewport}
      containerRef={containerRef}
      placement={isEditing ? "bottom" : "top"}
      offset={isEditing ? 12 : 16}
    >
      <div
        {...(toolbarSelector
          ? { [toolbarSelector]: "true" }
          : { "data-widget-toolbar": "true" })}
        className={cn(
          "pointer-events-auto flex items-center gap-3 rounded-2xl border px-3.5 py-1.5",
          "backdrop-blur-xl transition-all duration-300",
          "hover:shadow-[0_10px_38px_-14px_rgba(0,0,0,0.3)]",
          isDarkTheme
            ? "border-white/10 bg-black shadow-[0_6px_30px_-14px_rgba(0,0,0,0.5)] hover:bg-black/90"
            : "border-white/20 bg-white/80 shadow-[0_6px_30px_-14px_rgba(0,0,0,0.25)] hover:bg-white/90"
        )}
        onPointerDown={(event) => {
          event.stopPropagation();
        }}
      >
        {controls.map((control, index) => renderControl(control, index))}
        {customControls}
      </div>
    </ToolbarPortal>
  );
};
