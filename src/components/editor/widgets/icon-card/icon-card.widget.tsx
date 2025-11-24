"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronDown, Sparkles } from "lucide-react";
import * as Icons from "lucide-react";
import type { ResizeHandle } from "@/components/editor/widgets/types";
import type { IconCardWidget } from "./types";
import {
  TOOLBAR_SELECTOR,
  ALIGN_OPTIONS,
  GOOGLE_FONTS,
  ICON_CATEGORIES,
  ALL_ICONS,
} from "./constants";
import { ResizeHandles } from "@/components/editor/resize-handles";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectActiveSlideId,
  updateWidget as updateWidgetAction,
} from "@/store/slices/slidesSlice";
import { useDebouncedCallback } from "use-debounce";
import type { Viewport } from "@/hooks/use-canvas-viewport";
import { ToolbarPortal } from "@/components/editor/toolbar-portal";
import { Popover } from "@headlessui/react";
import { PopoverPanelPortal } from "@/components/editor/background/popover-panel-portal";
import { HexColorPicker } from "react-colorful";
import { Input } from "@/components/ui/input";
import { X, Search as SearchIcon } from "lucide-react";
import { createPortal } from "react-dom";

type IconCardWidgetNodeProps = {
  widget: IconCardWidget;
  isSelected: boolean;
  isEditing: boolean;
  baseZIndex: number;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  getResizePointerDown: (
    handle: ResizeHandle
  ) => (event: React.PointerEvent<HTMLDivElement>) => void;
  viewport: Viewport;
  containerRef: React.RefObject<HTMLElement | null>;
};

type ActiveField = "title" | "description" | null;

type LucideIcon = React.ComponentType<
  React.SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number }
>;

const IconCardWidgetNodeBase: React.FC<IconCardWidgetNodeProps> = ({
  widget,
  isSelected,
  isEditing,
  baseZIndex,
  onPointerDown,
  getResizePointerDown,
  viewport,
  containerRef,
}) => {
  const dispatch = useAppDispatch();
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const widgetRef = React.useRef<HTMLDivElement>(null);

  const [localTitle, setLocalTitle] = React.useState(widget.title || "");
  const [localDescription, setLocalDescription] = React.useState(
    widget.description || ""
  );
  const [activeField, setActiveField] = React.useState<ActiveField>(null);
  const [showIconSelector, setShowIconSelector] = React.useState(false);

  const titleInputRef = React.useRef<HTMLInputElement | null>(null);
  const descriptionTextareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  // Auto-resize textarea based on content
  React.useLayoutEffect(() => {
    const textarea = descriptionTextareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [localDescription]);

  const debouncedUpdateTitle = useDebouncedCallback((value: string) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { title: value },
      })
    );
  }, 250);

  const debouncedUpdateDescription = useDebouncedCallback((value: string) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { description: value },
      })
    );
  }, 250);

  React.useEffect(() => {
    setLocalTitle((prev) =>
      prev === widget.title ? prev : widget.title || ""
    );
  }, [widget.title]);

  React.useEffect(() => {
    setLocalDescription((prev) =>
      prev === widget.description ? prev : widget.description || ""
    );
  }, [widget.description]);

  React.useEffect(() => {
    return () => {
      debouncedUpdateTitle.flush();
      debouncedUpdateDescription.flush();
    };
  }, [debouncedUpdateTitle, debouncedUpdateDescription]);

  // Reset active field when widget is deselected
  React.useEffect(() => {
    if (!isSelected) {
      setActiveField(null);
    }
  }, [isSelected]);

  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement;
      // Don't start drag if clicking on toolbar, input/textarea, or icon selector
      if (
        target.closest(TOOLBAR_SELECTOR) ||
        target.closest("[data-icon-selector]") ||
        target.closest("[data-icon-button]") ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA"
      ) {
        return;
      }
      if (event.detail > 1) {
        return;
      }
      onPointerDown(event);
    },
    [onPointerDown]
  );

  const handleIconClick = React.useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      if (isSelected) {
        setShowIconSelector(true);
      }
    },
    [isSelected]
  );

  const handleSelectIcon = React.useCallback(
    (iconName: string) => {
      dispatch(
        updateWidgetAction({
          slideId: activeSlideId,
          widgetId: widget.id,
          updates: { icon: iconName },
        })
      );
      setShowIconSelector(false);
    },
    [dispatch, activeSlideId, widget.id]
  );

  const handleFieldFocus = React.useCallback((field: ActiveField) => {
    setActiveField(field);
  }, []);

  const handleFieldBlur = React.useCallback(
    (field: ActiveField) => {
      if (field === "title") {
        debouncedUpdateTitle.flush();
      } else if (field === "description") {
        debouncedUpdateDescription.flush();
      }
    },
    [debouncedUpdateTitle, debouncedUpdateDescription]
  );

  const handleFieldKeyDown = React.useCallback(
    (field: ActiveField, event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (field === "title") {
          debouncedUpdateTitle.flush();
        } else if (field === "description") {
          debouncedUpdateDescription.flush();
        }
        // Blur the field
        if (field === "title" && titleInputRef.current) {
          titleInputRef.current.blur();
        } else if (field === "description" && descriptionTextareaRef.current) {
          descriptionTextareaRef.current.blur();
        }
      }
    },
    [debouncedUpdateTitle, debouncedUpdateDescription]
  );

  // Widget-local colors and fonts with sensible defaults
  const backgroundColor = widget.backgroundColor ?? "#ffffff";
  const iconColor = widget.iconColor ?? "#0f172a";
  const titleColor = widget.titleColor ?? "#0f172a";
  const descriptionColor = widget.descriptionColor ?? "#475569";
  const iconSize = widget.iconSize ?? 48;
  const titleFontFamily = widget.titleFontFamily ?? "var(--font-poppins)";
  const descriptionFontFamily =
    widget.descriptionFontFamily ?? "var(--font-poppins)";
  const textAlign = widget.textAlign ?? "left";
  const backgroundType = widget.backgroundType ?? "solid";
  const isGlassBackground = backgroundType === "glass";

  // Get the icon component
  const IconComponent = (Icons as unknown as Record<string, LucideIcon>)[
    widget.icon || "Star"
  ];

  return (
    <div
      ref={widgetRef}
      className={cn(
        "canvas-element group absolute flex select-none border border-transparent transition",
        isSelected && !isEditing
          ? "border-primary/70 ring-1 ring-primary/60"
          : "border-transparent",
        "cursor-move"
      )}
      style={{
        left: widget.x,
        top: widget.y,
        width: widget.width,
        height: widget.height,
        zIndex: baseZIndex,
      }}
      onPointerDown={handlePointerDown}
    >
      <div className="canvas-element__content relative flex h-full w-full items-stretch justify-stretch rounded">
        {isSelected && (
          <IconCardEditingToolbar
            widget={widget}
            isEditing={isEditing}
            activeField={activeField}
            widgetRef={widgetRef}
            viewport={viewport}
            containerRef={containerRef}
          />
        )}
        <div
          className={cn(
            "relative h-full w-full rounded-2xl p-5 transition-all duration-300 ease-out",
            isGlassBackground &&
              "backdrop-blur-2xl border border-white/10 shadow-2xl"
          )}
          style={{
            backgroundColor: isGlassBackground
              ? `${backgroundColor}03` // Almost clear for maximum transparency
              : backgroundColor,
            backgroundImage: isGlassBackground
              ? "linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.02) 100%)"
              : undefined,
            boxShadow: isGlassBackground
              ? "inset 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 0 rgba(255, 255, 255, 0.25), 0 8px 32px -8px rgba(0, 0, 0, 0.1)"
              : "0 2px 8px -2px rgba(0, 0, 0, 0.08)",
          }}
        >
          <div className="flex h-full flex-col gap-3" style={{ textAlign }}>
            {/* Icon */}
            <div
              className="flex relative"
              style={{
                justifyContent:
                  textAlign === "center"
                    ? "center"
                    : textAlign === "right"
                    ? "flex-end"
                    : "flex-start",
              }}
            >
              {IconComponent && (
                <button
                  data-icon-button
                  onClick={handleIconClick}
                  disabled={!isSelected}
                  className={cn(
                    "rounded-xl p-2.5 transition-all duration-200 group/icon-btn",
                    isSelected
                      ? "hover:bg-muted/40 cursor-pointer ring-1 ring-transparent hover:ring-primary/30 hover:scale-105"
                      : "cursor-default"
                  )}
                  title={
                    isSelected
                      ? "Click to change icon"
                      : "Select card to change icon"
                  }
                >
                  <IconComponent
                    size={iconSize}
                    style={{ color: iconColor }}
                    strokeWidth={2}
                    className="transition-transform duration-200 group-hover/icon-btn:scale-105"
                  />
                </button>
              )}

              {/* Icon Selector Modal - Rendered in portal */}
              {showIconSelector && isSelected && (
                <IconSelectorModal
                  currentIcon={widget.icon || "Star"}
                  onSelectIcon={handleSelectIcon}
                  onClose={() => setShowIconSelector(false)}
                />
              )}
            </div>

            {/* Title field */}
            <input
              ref={titleInputRef}
              type="text"
              readOnly={!isSelected}
              className={cn(
                "w-full resize-none border-none bg-transparent p-0 outline-none focus:ring-0",
                isSelected ? "cursor-text" : "cursor-default"
              )}
              style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                color: titleColor,
                fontFamily: titleFontFamily,
                lineHeight: 1.25,
                textAlign,
              }}
              value={localTitle}
              onChange={(e) => {
                if (!isSelected) return;
                setLocalTitle(e.target.value);
                debouncedUpdateTitle(e.target.value);
              }}
              onFocus={() => {
                if (!isSelected) return;
                handleFieldFocus("title");
              }}
              onBlur={() => handleFieldBlur("title")}
              onKeyDown={(e) => handleFieldKeyDown("title", e)}
              placeholder="Feature Title"
            />

            {/* Description field */}
            <textarea
              ref={descriptionTextareaRef}
              readOnly={!isSelected}
              className={cn(
                "w-full resize-none border-none bg-transparent p-0 outline-none focus:ring-0 overflow-hidden",
                isSelected ? "cursor-text" : "cursor-default"
              )}
              style={{
                fontSize: "0.875rem",
                color: descriptionColor,
                fontFamily: descriptionFontFamily,
                lineHeight: 1.5,
                wordWrap: "break-word",
                overflowWrap: "break-word",
                minHeight: "3rem",
                overflow: "hidden",
                textAlign,
              }}
              value={localDescription}
              onChange={(e) => {
                if (!isSelected) return;
                setLocalDescription(e.target.value);
                debouncedUpdateDescription(e.target.value);
                // Auto-resize on change
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              onFocus={() => {
                if (!isSelected) return;
                handleFieldFocus("description");
              }}
              onBlur={() => handleFieldBlur("description")}
              onKeyDown={(e) => handleFieldKeyDown("description", e)}
              placeholder="Feature description goes here."
            />
          </div>
        </div>
        {isSelected && !isEditing && (
          <ResizeHandles getResizePointerDown={getResizePointerDown} />
        )}
      </div>
    </div>
  );
};

export const IconCardWidgetNode = React.memo(IconCardWidgetNodeBase);

type IconCardEditingToolbarProps = {
  widget: IconCardWidget;
  isEditing: boolean;
  activeField: ActiveField;
  widgetRef: React.RefObject<HTMLElement | null>;
  viewport: Viewport;
  containerRef: React.RefObject<HTMLElement | null>;
};

const IconCardEditingToolbar: React.FC<IconCardEditingToolbarProps> = ({
  widget,
  isEditing,
  activeField,
  widgetRef,
  viewport,
  containerRef,
}) => {
  const bgColorPickerButtonRef = React.useRef<HTMLButtonElement>(null);
  const iconColorPickerButtonRef = React.useRef<HTMLButtonElement>(null);
  const textColorPickerButtonRef = React.useRef<HTMLButtonElement>(null);
  const fontButtonRef = React.useRef<HTMLButtonElement>(null);
  const fontMenuRef = React.useRef<HTMLDivElement>(null);
  const [fontMenuOpen, setFontMenuOpen] = React.useState(false);
  const dispatch = useAppDispatch();
  const activeSlideId = useAppSelector(selectActiveSlideId);

  // Close menus when clicking outside
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

  const handleSetBackgroundColor = (color: string) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { backgroundColor: color },
      })
    );
  };

  const handleToggleGlassBackground = () => {
    const newBackgroundType =
      widget.backgroundType === "glass" ? "solid" : "glass";
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { backgroundType: newBackgroundType },
      })
    );
  };

  const handleSetIconColor = (color: string) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { iconColor: color },
      })
    );
  };

  const handleSetTextColor = (color: string) => {
    if (!activeField) return;

    const colorKey =
      activeField === "title" ? "titleColor" : "descriptionColor";

    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { [colorKey]: color },
      })
    );
  };

  const handleSetFontFamily = (fontFamily: string) => {
    if (!activeField) return;

    const fontKey =
      activeField === "title" ? "titleFontFamily" : "descriptionFontFamily";

    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { [fontKey]: fontFamily },
      })
    );
  };

  const handleSetIconSize = (size: number) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { iconSize: size },
      })
    );
  };

  const handleAlign = (align: "left" | "center" | "right") => {
    if (align !== (widget.textAlign ?? "left")) {
      dispatch(
        updateWidgetAction({
          slideId: activeSlideId,
          widgetId: widget.id,
          updates: { textAlign: align },
        })
      );
    }
  };

  const currentAlign = widget.textAlign ?? "left";
  const currentBackgroundColor = widget.backgroundColor ?? "#ffffff";
  const currentIconColor = widget.iconColor ?? "#0f172a";

  const currentTextColor =
    activeField === "title"
      ? widget.titleColor ?? "#0f172a"
      : activeField === "description"
      ? widget.descriptionColor ?? "#475569"
      : "#0f172a";

  const currentFontFamily =
    activeField === "title"
      ? widget.titleFontFamily ?? "var(--font-poppins)"
      : activeField === "description"
      ? widget.descriptionFontFamily ?? "var(--font-poppins)"
      : "var(--font-poppins)";

  const currentFontLabel =
    GOOGLE_FONTS.find((font) => font.value === currentFontFamily)?.label ??
    "Poppins";

  const currentIconSize = widget.iconSize ?? 48;

  return (
    <ToolbarPortal
      widgetRef={widgetRef}
      viewport={viewport}
      containerRef={containerRef}
      placement={isEditing ? "bottom" : "top"}
      offset={isEditing ? 12 : 16}
    >
      <div
        data-icon-card-toolbar="true"
        className="pointer-events-auto flex items-center gap-3 rounded-full border border-white/20 bg-white/80 px-4 py-2.5 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-all duration-300 hover:bg-white/90 hover:shadow-[0_12px_48px_-12px_rgba(0,0,0,0.25)]"
        onPointerDown={(event) => {
          event.stopPropagation();
        }}
      >
        {/* Icon Section */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center gap-2 group/icon">
            <Popover>
              {({ open }) => (
                <>
                  <Popover.Button
                    ref={iconColorPickerButtonRef}
                    className="relative w-6 h-6 rounded-full cursor-pointer ring-1 ring-black/5 shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition-all hover:scale-110 hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] focus:outline-none active:scale-95"
                    style={{ backgroundColor: currentIconColor }}
                  >
                    <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/5" />
                  </Popover.Button>
                  {open && (
                    <PopoverPanelPortal buttonRef={iconColorPickerButtonRef}>
                      <div className="flex flex-col gap-3 p-3 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/20 animate-in fade-in zoom-in-95 duration-200 min-w-[240px]">
                        <div className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider px-1">
                          Icon Color
                        </div>
                        <HexColorPicker
                          color={currentIconColor}
                          onChange={handleSetIconColor}
                          className="w-full! h-32! rounded-xl!"
                        />
                        <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-lg border border-black/5">
                          <div
                            className="w-6 h-6 rounded-full border border-black/10 shadow-sm shrink-0"
                            style={{
                              backgroundColor: currentIconColor,
                            }}
                          />
                          <Input
                            className="h-7 text-xs font-mono border-none bg-transparent focus-visible:ring-0 px-1 uppercase w-full text-muted-foreground"
                            value={currentIconColor}
                            onChange={(e) => handleSetIconColor(e.target.value)}
                            placeholder="#000000"
                          />
                        </div>
                      </div>
                    </PopoverPanelPortal>
                  )}
                </>
              )}
            </Popover>

            <div className="flex items-center gap-1.5 bg-black/5 rounded-full pl-2 pr-1 py-0.5 transition-colors hover:bg-black/10">
              <span className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider select-none">
                Size
              </span>
              <Input
                type="number"
                min="16"
                max="128"
                value={currentIconSize}
                onChange={(e) => handleSetIconSize(Number(e.target.value))}
                className="h-6 w-12 rounded-full border-none bg-transparent text-center text-xs font-medium p-0 focus-visible:ring-0"
              />
            </div>
          </div>
        </div>

        <div className="h-5 w-px bg-black/10 rounded-full" />

        {/* Background Section */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center gap-2">
            <Popover>
              {({ open }) => (
                <>
                  <Popover.Button
                    ref={bgColorPickerButtonRef}
                    className="relative w-6 h-6 rounded-full cursor-pointer ring-1 ring-black/5 shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition-all hover:scale-110 hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] focus:outline-none active:scale-95"
                    style={{ backgroundColor: currentBackgroundColor }}
                  >
                    <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/5" />
                    {currentBackgroundColor !== "#ffffff" && (
                      <span
                        className="absolute -top-1 -right-1 flex items-center justify-center w-3.5 h-3.5 bg-neutral-900 text-white rounded-full cursor-pointer opacity-0 group-hover/picker:opacity-100 transition-all shadow-sm scale-75 hover:scale-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetBackgroundColor("#ffffff");
                        }}
                      >
                        <X size={8} strokeWidth={3} />
                      </span>
                    )}
                  </Popover.Button>
                  {open && (
                    <PopoverPanelPortal buttonRef={bgColorPickerButtonRef}>
                      <div className="flex flex-col gap-3 p-3 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/20 animate-in fade-in zoom-in-95 duration-200 min-w-[240px]">
                        <div className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider px-1">
                          Background
                        </div>
                        <HexColorPicker
                          color={currentBackgroundColor}
                          onChange={handleSetBackgroundColor}
                          className="w-full! h-32! rounded-xl!"
                        />
                        <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-lg border border-black/5">
                          <div
                            className="w-6 h-6 rounded-full border border-black/10 shadow-sm shrink-0"
                            style={{
                              backgroundColor: currentBackgroundColor,
                            }}
                          />
                          <Input
                            className="h-7 text-xs font-mono border-none bg-transparent focus-visible:ring-0 px-1 uppercase w-full text-muted-foreground"
                            value={currentBackgroundColor}
                            onChange={(e) =>
                              handleSetBackgroundColor(e.target.value)
                            }
                            placeholder="#000000"
                          />
                        </div>
                      </div>
                    </PopoverPanelPortal>
                  )}
                </>
              )}
            </Popover>
            <Button
              variant="ghost"
              size="icon-sm"
              className={cn(
                "w-8 h-8 rounded-full transition-all duration-200",
                widget.backgroundType === "glass"
                  ? "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 shadow-inner"
                  : "hover:bg-black/5 text-muted-foreground"
              )}
              onClick={handleToggleGlassBackground}
              title={
                widget.backgroundType === "glass"
                  ? "Disable Glass Effect"
                  : "Enable Glass Effect"
              }
            >
              <Sparkles className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Text & Font Section - Only show when a field is active */}
        {activeField && (
          <>
            <div className="h-5 w-px bg-black/10 rounded-full animate-in fade-in zoom-in duration-200" />
            <div className="flex items-center gap-3 animate-in slide-in-from-left-2 duration-200 fade-in">
              <div className="relative flex items-center gap-2">
                <Popover>
                  {({ open }) => (
                    <>
                      <Popover.Button
                        ref={textColorPickerButtonRef}
                        className="relative w-6 h-6 rounded-full cursor-pointer ring-1 ring-black/5 shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition-all hover:scale-110 hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] focus:outline-none active:scale-95"
                        style={{ backgroundColor: currentTextColor }}
                      >
                        <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/5" />
                      </Popover.Button>
                      {open && (
                        <PopoverPanelPortal
                          buttonRef={textColorPickerButtonRef}
                        >
                          <div className="flex flex-col gap-3 p-3 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/20 animate-in fade-in zoom-in-95 duration-200 min-w-[240px]">
                            <div className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider px-1">
                              {activeField} Color
                            </div>
                            <HexColorPicker
                              color={currentTextColor}
                              onChange={handleSetTextColor}
                              className="w-full! h-32! rounded-xl!"
                            />
                            <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-lg border border-black/5">
                              <div
                                className="w-6 h-6 rounded-full border border-black/10 shadow-sm shrink-0"
                                style={{
                                  backgroundColor: currentTextColor,
                                }}
                              />
                              <Input
                                className="h-7 text-xs font-mono border-none bg-transparent focus-visible:ring-0 px-1 uppercase w-full text-muted-foreground"
                                value={currentTextColor}
                                onChange={(e) =>
                                  handleSetTextColor(e.target.value)
                                }
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

              <div className="relative flex items-center">
                <Button
                  ref={fontButtonRef}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 rounded-full bg-black/5 border border-transparent px-3 py-1.5 text-xs hover:bg-black/10 transition-all w-[110px] justify-between group"
                  onClick={() => setFontMenuOpen((prev) => !prev)}
                >
                  <span className="text-[11px] font-medium text-foreground/80 truncate group-hover:text-foreground">
                    {currentFontLabel}
                  </span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </Button>
                {fontMenuOpen && (
                  <div
                    ref={fontMenuRef}
                    className="absolute left-0 top-full mt-2 z-50 min-w-[200px] max-h-[300px] overflow-y-auto rounded-xl border border-white/20 bg-white/90 backdrop-blur-xl p-1.5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="flex flex-col gap-0.5">
                      {GOOGLE_FONTS.map((font) => (
                        <button
                          key={font.value}
                          type="button"
                          className={cn(
                            "flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all duration-200",
                            currentFontFamily === font.value
                              ? "bg-black/5 text-foreground font-medium"
                              : "text-muted-foreground hover:bg-black/5 hover:text-foreground"
                          )}
                          style={{ fontFamily: font.style }}
                          onClick={() => {
                            handleSetFontFamily(font.value);
                            setFontMenuOpen(false);
                          }}
                        >
                          <span>{font.label}</span>
                          {currentFontFamily === font.value && (
                            <span className="text-blue-600 text-xs">●</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <div className="h-5 w-px bg-black/10 rounded-full" />

        {/* Alignment Section */}
        <div className="flex items-center gap-1 bg-black/5 rounded-full p-1">
          {ALIGN_OPTIONS.map(({ value, icon: Icon, label }) => (
            <Button
              key={value}
              variant="ghost"
              size="icon-sm"
              className={cn(
                "w-7 h-7 rounded-full transition-all duration-200",
                currentAlign === value
                  ? "bg-white text-foreground shadow-sm ring-1 ring-black/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-black/5"
              )}
              onClick={() => handleAlign(value)}
              aria-pressed={currentAlign === value}
              title={label}
            >
              <Icon className="h-3.5 w-3.5" />
            </Button>
          ))}
        </div>
      </div>
    </ToolbarPortal>
  );
};

type IconSelectorModalProps = {
  currentIcon: string;
  onSelectIcon: (iconName: string) => void;
  onClose: () => void;
};

const IconSelectorModal: React.FC<IconSelectorModalProps> = ({
  currentIcon,
  onSelectIcon,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] =
    React.useState<string>("Popular");
  const modalRef = React.useRef<HTMLDivElement>(null);

  // Click outside to close
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Filter icons based on search
  const filteredIcons = React.useMemo(() => {
    if (!searchQuery) {
      return (
        ICON_CATEGORIES[selectedCategory as keyof typeof ICON_CATEGORIES] || []
      );
    }
    return ALL_ICONS.filter((icon) =>
      icon.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, selectedCategory]);

  // Render modal in portal to appear above everything
  if (typeof window === "undefined") return null;

  return createPortal(
    <div
      data-icon-selector
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        className="relative w-[700px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-border/50 animate-in zoom-in-95 duration-200 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Choose an Icon
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Select from {ALL_ICONS.length}+ beautiful icons
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="px-6 pt-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search icons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
              autoFocus
            />
          </div>
        </div>

        {/* Categories */}
        {!searchQuery && (
          <div className="px-6 pt-4">
            <div className="flex flex-wrap gap-2">
              {Object.keys(ICON_CATEGORIES).map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200",
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Icons Grid */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {filteredIcons.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No icons found
              </h3>
              <p className="text-sm text-muted-foreground">
                Try searching with different keywords
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-8 gap-2">
              {filteredIcons.map((iconName) => {
                const IconComp = (
                  Icons as unknown as Record<string, LucideIcon>
                )[iconName];
                if (!IconComp) return null;
                const isSelected = iconName === currentIcon;

                return (
                  <button
                    key={iconName}
                    onClick={() => onSelectIcon(iconName)}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 group",
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20"
                        : "hover:bg-muted/80 text-foreground/70 hover:text-foreground"
                    )}
                    title={iconName}
                  >
                    <IconComp
                      className={cn(
                        "h-6 w-6 transition-transform duration-200",
                        !isSelected && "group-hover:scale-110"
                      )}
                    />
                    <span className="text-[9px] mt-1.5 font-medium truncate w-full text-center">
                      {iconName}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-muted/30">
          <p className="text-xs text-muted-foreground">
            {filteredIcons.length} icon{filteredIcons.length !== 1 ? "s" : ""}{" "}
            available
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-lg"
          >
            Close
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};
