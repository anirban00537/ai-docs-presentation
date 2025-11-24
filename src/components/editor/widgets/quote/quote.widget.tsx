"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import type { ResizeHandle } from "@/components/editor/widgets/types";
import type { QuoteWidget } from "./types";
import {
  TOOLBAR_SELECTOR,
  ALIGN_OPTIONS,
  GOOGLE_FONTS,
  FONT_SIZES,
} from "./constants";
import { ResizeHandles } from "@/components/editor/resize-handles";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectActiveSlideId,
  selectGlobalTheme,
  updateWidget as updateWidgetAction,
} from "@/store/slices/slidesSlice";
import { useDebouncedCallback } from "use-debounce";
import type { Viewport } from "@/hooks/use-canvas-viewport";
import { ToolbarPortal } from "@/components/editor/toolbar-portal";
import { Popover } from "@headlessui/react";
import { PopoverPanelPortal } from "@/components/editor/background/popover-panel-portal";
import { HexColorPicker } from "react-colorful";
import { Input } from "@/components/ui/input";
import { Plus, Minus, Quote as QuoteIcon } from "lucide-react";

type QuoteWidgetNodeProps = {
  widget: QuoteWidget;
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

type ActiveField = "quote" | "attribution" | null;

const QuoteWidgetNodeBase: React.FC<QuoteWidgetNodeProps> = ({
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
  const globalTheme = useAppSelector(selectGlobalTheme);
  const widgetRef = React.useRef<HTMLDivElement>(null);

  const [localQuote, setLocalQuote] = React.useState(widget.quote || "");
  const [localAttribution, setLocalAttribution] = React.useState(
    widget.attribution || ""
  );
  const [activeField, setActiveField] = React.useState<ActiveField>(null);

  const quoteTextareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const attributionInputRef = React.useRef<HTMLInputElement | null>(null);
  const contentContainerRef = React.useRef<HTMLDivElement | null>(null);

  const debouncedUpdateQuote = useDebouncedCallback((value: string) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { quote: value },
      })
    );
  }, 250);

  const debouncedUpdateAttribution = useDebouncedCallback((value: string) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { attribution: value },
      })
    );
  }, 250);

  React.useEffect(() => {
    setLocalQuote((prev) =>
      prev === widget.quote ? prev : widget.quote || ""
    );
  }, [widget.quote]);

  React.useEffect(() => {
    setLocalAttribution((prev) =>
      prev === widget.attribution ? prev : widget.attribution || ""
    );
  }, [widget.attribution]);

  React.useEffect(() => {
    return () => {
      debouncedUpdateQuote.flush();
      debouncedUpdateAttribution.flush();
    };
  }, [debouncedUpdateQuote, debouncedUpdateAttribution]);

  // Reset active field when widget is deselected
  React.useEffect(() => {
    if (!isSelected) {
      setActiveField(null);
    }
  }, [isSelected]);

  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement;
      // Don't start drag if clicking on toolbar, input/textarea
      if (
        target.closest(TOOLBAR_SELECTOR) ||
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

  const handleFieldFocus = React.useCallback((field: ActiveField) => {
    setActiveField(field);
  }, []);

  const handleFieldBlur = React.useCallback(
    (field: ActiveField) => {
      if (field === "quote") {
        debouncedUpdateQuote.flush();
      } else if (field === "attribution") {
        debouncedUpdateAttribution.flush();
      }
    },
    [debouncedUpdateQuote, debouncedUpdateAttribution]
  );

  const handleFieldKeyDown = React.useCallback(
    (field: ActiveField, event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (field === "quote") {
          debouncedUpdateQuote.flush();
        } else if (field === "attribution") {
          debouncedUpdateAttribution.flush();
        }
        // Blur the field
        if (field === "quote" && quoteTextareaRef.current) {
          quoteTextareaRef.current.blur();
        } else if (field === "attribution" && attributionInputRef.current) {
          attributionInputRef.current.blur();
        }
      }
    },
    [debouncedUpdateQuote, debouncedUpdateAttribution]
  );

  // Widget-local colors and fonts with sensible defaults
  const backgroundColor = widget.backgroundColor ?? "#ffffff";
  const quoteColor = widget.quoteColor ?? globalTheme?.accent ?? "#0f172a";
  const attributionColor = widget.attributionColor ?? "#64748b";
  const iconColor = widget.iconColor ?? globalTheme?.accent ?? "#0f172a"; // Used for quote marks
  const quoteFontFamily = widget.quoteFontFamily ?? "var(--font-poppins)";
  const attributionFontFamily =
    widget.attributionFontFamily ?? "var(--font-poppins)";
  const textAlign = widget.textAlign ?? "center";
  const backgroundType = widget.backgroundType ?? "solid";
  const quoteFontSize = widget.quoteFontSize ?? 24;
  const attributionFontSize = widget.attributionFontSize ?? 14;
  const isGlassBackground = backgroundType === "glass";

  // Auto-resize logic removed to allow manual resizing and scrolling

  const renderQuote = () => {
    const baseQuoteClasses = cn(
      "w-full h-full resize-none border-none bg-transparent p-0 outline-none focus:ring-0",
      "overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
      isSelected ? "cursor-text" : "cursor-default"
    );

    const quoteStyle: React.CSSProperties = {
      fontFamily: quoteFontFamily,
      color: quoteColor,
      textAlign,
      wordWrap: "break-word",
      overflowWrap: "break-word",
      lineHeight: 1.4,
      fontSize: `${quoteFontSize}px`,
      fontWeight: 500,
    };

    return (
      <div className="relative px-8 py-4 w-full h-full flex flex-col">
        <QuoteIcon
          className="absolute top-0 left-0 w-12 h-12 opacity-20"
          style={{ color: iconColor }}
        />
        <textarea
          ref={quoteTextareaRef}
          readOnly={!isSelected}
          className={baseQuoteClasses}
          style={quoteStyle}
          value={localQuote}
          onChange={(e) => {
            if (!isSelected) return;
            setLocalQuote(e.target.value);
            debouncedUpdateQuote(e.target.value);
          }}
          onFocus={() => {
            if (!isSelected) return;
            handleFieldFocus("quote");
          }}
          onBlur={() => handleFieldBlur("quote")}
          onKeyDown={(e) => handleFieldKeyDown("quote", e)}
          placeholder="Enter your quote here..."
        />
        <QuoteIcon
          className="absolute bottom-0 right-0 w-12 h-12 rotate-180 opacity-20"
          style={{ color: iconColor }}
        />
      </div>
    );
  };

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
      <div
        className="canvas-element__content relative flex w-full items-stretch justify-stretch rounded"
        style={{ height: widget.height }}
      >
        {isSelected && (
          <QuoteEditingToolbar
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
            "relative w-full h-full transition-all duration-300 ease-out overflow-hidden rounded-2xl p-6",
            isGlassBackground &&
              "backdrop-blur-2xl border border-white/10 shadow-2xl"
          )}
          style={{
            backgroundColor: isGlassBackground
              ? `${backgroundColor}03`
              : backgroundColor,
            backgroundImage: isGlassBackground
              ? "linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.02) 100%)"
              : undefined,
            boxShadow: isGlassBackground
              ? "inset 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 0 rgba(255, 255, 255, 0.25), 0 8px 32px -8px rgba(0, 0, 0, 0.1)"
              : "0 2px 8px -2px rgba(0, 0, 0, 0.08)",
          }}
        >
          <div
            ref={contentContainerRef}
            className="flex flex-col gap-4 justify-center h-full"
            style={{ textAlign }}
          >
            {renderQuote()}

            {localAttribution && (
              <div
                className="flex mt-2"
                style={{
                  justifyContent:
                    textAlign === "center"
                      ? "center"
                      : textAlign === "right"
                      ? "flex-end"
                      : "flex-start",
                }}
              >
                <input
                  ref={attributionInputRef}
                  type="text"
                  readOnly={!isSelected}
                  className={cn(
                    "w-auto min-w-[100px] resize-none border-none bg-transparent p-0 outline-none focus:ring-0",
                    isSelected ? "cursor-text" : "cursor-default"
                  )}
                  style={{
                    fontSize: `${attributionFontSize}px`,
                    fontWeight: 500,
                    color: attributionColor,
                    fontFamily: attributionFontFamily,
                    lineHeight: 1.4,
                    textAlign,
                  }}
                  size={localAttribution.length || 10}
                  value={localAttribution}
                  onChange={(e) => {
                    if (!isSelected) return;
                    setLocalAttribution(e.target.value);
                    debouncedUpdateAttribution(e.target.value);
                  }}
                  onFocus={() => {
                    if (!isSelected) return;
                    handleFieldFocus("attribution");
                  }}
                  onBlur={() => handleFieldBlur("attribution")}
                  onKeyDown={(e) => handleFieldKeyDown("attribution", e)}
                  placeholder="— Attribution"
                />
              </div>
            )}
          </div>
        </div>
        {isSelected && !isEditing && (
          <ResizeHandles getResizePointerDown={getResizePointerDown} />
        )}
      </div>
    </div>
  );
};

export const QuoteWidgetNode = React.memo(QuoteWidgetNodeBase);

type QuoteEditingToolbarProps = {
  widget: QuoteWidget;
  isEditing: boolean;
  activeField: ActiveField;
  widgetRef: React.RefObject<HTMLElement | null>;
  viewport: Viewport;
  containerRef: React.RefObject<HTMLElement | null>;
};

const QuoteEditingToolbar: React.FC<QuoteEditingToolbarProps> = ({
  widget,
  activeField,
  widgetRef,
  viewport,
  containerRef,
}) => {
  const bgColorPickerButtonRef = React.useRef<HTMLButtonElement>(null);
  const quoteColorPickerButtonRef = React.useRef<HTMLButtonElement>(null);
  const attributionColorPickerButtonRef = React.useRef<HTMLButtonElement>(null);
  const iconColorPickerButtonRef = React.useRef<HTMLButtonElement>(null);
  const fontButtonRef = React.useRef<HTMLButtonElement>(null);
  const fontSizeMenuRef = React.useRef<HTMLDivElement>(null);
  const fontMenuRef = React.useRef<HTMLDivElement>(null);
  const [fontMenuOpen, setFontMenuOpen] = React.useState(false);
  const [fontSizeMenuOpen, setFontSizeMenuOpen] = React.useState(false);
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

      if (
        fontSizeMenuOpen &&
        fontSizeMenuRef.current &&
        !fontSizeMenuRef.current.contains(target)
      ) {
        setFontSizeMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [fontMenuOpen, fontSizeMenuOpen]);

  const handleSetBackgroundColor = (color: string) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { backgroundColor: color },
      })
    );
  };

  const handleSetQuoteColor = (color: string) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { quoteColor: color },
      })
    );
  };

  const handleSetAttributionColor = (color: string) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { attributionColor: color },
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

  const handleSetTextAlign = (align: QuoteWidget["textAlign"]) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { textAlign: align },
      })
    );
  };

  const handleToggleBackgroundType = () => {
    const nextType = widget.backgroundType === "glass" ? "solid" : "glass";
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { backgroundType: nextType },
      })
    );
  };

  const handleSetFontFamily = (fontFamily: string) => {
    if (!activeField) return;

    const fontKey =
      activeField === "quote" ? "quoteFontFamily" : "attributionFontFamily";

    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { [fontKey]: fontFamily },
      })
    );
    setFontMenuOpen(false);
  };

  const handleSetFontSize = (fontSize: number) => {
    if (!activeField) return;

    const sizeKey =
      activeField === "quote" ? "quoteFontSize" : "attributionFontSize";

    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { [sizeKey]: fontSize },
      })
    );
    setFontSizeMenuOpen(false);
  };

  const adjustFontSize = (delta: number) => {
    if (!activeField) return;

    const sizeKey =
      activeField === "quote" ? "quoteFontSize" : "attributionFontSize";
    const currentSize =
      (activeField === "quote"
        ? widget.quoteFontSize ?? (widget.style === "bold" ? 28 : 20)
        : widget.attributionFontSize ?? 12) + delta;

    const clampedSize = Math.max(8, Math.min(200, currentSize));

    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { [sizeKey]: clampedSize },
      })
    );
  };

  const globalTheme = useAppSelector(selectGlobalTheme);
  const currentBgColor = widget.backgroundColor ?? "#ffffff";
  const currentQuoteColor =
    widget.quoteColor ?? globalTheme?.accent ?? "#0f172a";
  const currentAttributionColor = widget.attributionColor ?? "#64748b";
  const currentIconColor = widget.iconColor ?? globalTheme?.accent ?? "#0f172a";

  const currentFontFamily =
    activeField === "quote"
      ? widget.quoteFontFamily ?? "var(--font-poppins)"
      : activeField === "attribution"
      ? widget.attributionFontFamily ?? "var(--font-poppins)"
      : "var(--font-poppins)";

  const currentFontSize =
    activeField === "quote"
      ? widget.quoteFontSize ?? 24
      : activeField === "attribution"
      ? widget.attributionFontSize ?? 14
      : 14;

  const currentFontLabel =
    GOOGLE_FONTS.find((font) => font.value === currentFontFamily)?.label ??
    "Poppins";

  return (
    <ToolbarPortal
      widgetRef={widgetRef}
      viewport={viewport}
      containerRef={containerRef}
      placement="top"
      offset={16}
    >
      <div
        data-quote-toolbar="true"
        className="pointer-events-auto flex items-center gap-2 rounded-lg border border-border bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur"
        onPointerDown={(event) => {
          event.stopPropagation();
        }}
      >
        {/* Alignment options */}
        <div className="flex items-center gap-1">
          {ALIGN_OPTIONS.map(({ value, icon: Icon, label }) => (
            <Button
              key={value}
              variant="ghost"
              size="icon-sm"
              className={cn(
                "rounded-md",
                widget.textAlign === value
                  ? "bg-primary/10 text-primary hover:bg-primary/10"
                  : undefined
              )}
              onClick={() => handleSetTextAlign(value)}
              aria-pressed={widget.textAlign === value}
              title={label}
            >
              <Icon className="h-4 w-4" />
            </Button>
          ))}
        </div>

        {/* Background type toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="rounded-md px-2 py-1 text-xs"
          onClick={handleToggleBackgroundType}
          title="Toggle background type"
        >
          {widget.backgroundType === "glass" ? "Glass" : "Solid"}
        </Button>

        {/* Font Size and Family - Only show when a field is active */}
        {activeField && (
          <>
            <div className="h-5 w-px bg-border" />

            {/* Font Size */}
            <div className="relative flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-7 w-7 rounded-md"
                onClick={() => adjustFontSize(-2)}
                aria-label="Decrease font size"
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <div className="relative" ref={fontSizeMenuRef}>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 min-w-[60px] rounded-md px-2 text-xs font-medium"
                  onClick={() => setFontSizeMenuOpen((prev) => !prev)}
                >
                  {currentFontSize}px
                </Button>
                {fontSizeMenuOpen && (
                  <div className="absolute left-0 top-full z-40 mt-1 min-w-[120px] max-h-[200px] overflow-y-auto rounded-md border border-border bg-white shadow-lg p-2">
                    <div className="flex flex-col gap-1">
                      {FONT_SIZES.map((size) => (
                        <button
                          key={size}
                          type="button"
                          className={cn(
                            "px-3 py-1.5 text-xs rounded-md text-left transition-colors",
                            currentFontSize === size
                              ? "bg-primary/10 text-primary font-medium"
                              : "hover:bg-accent text-muted-foreground"
                          )}
                          onClick={() => handleSetFontSize(size)}
                        >
                          {size}px
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-7 w-7 rounded-md"
                onClick={() => adjustFontSize(2)}
                aria-label="Increase font size"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Font Family */}
            <div className="relative" ref={fontMenuRef}>
              <Button
                ref={fontButtonRef}
                variant="outline"
                size="sm"
                className="min-w-[110px] justify-between px-3 py-1 text-xs font-medium"
                onClick={() => setFontMenuOpen((prev) => !prev)}
              >
                <span className="truncate">{currentFontLabel}</span>
                <ChevronDown
                  className={cn(
                    "ml-2 h-3 w-3 transition-transform shrink-0",
                    fontMenuOpen ? "rotate-180" : "rotate-0"
                  )}
                />
              </Button>
              {fontMenuOpen && (
                <div className="absolute left-0 top-full z-40 mt-1 min-w-[200px] max-h-[300px] overflow-y-auto rounded-md border border-border bg-white shadow-lg p-1.5">
                  <div className="flex flex-col gap-0.5">
                    {GOOGLE_FONTS.map((font) => (
                      <button
                        key={font.value}
                        type="button"
                        className={cn(
                          "flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-all",
                          currentFontFamily === font.value
                            ? "bg-accent text-foreground font-medium"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        )}
                        style={{ fontFamily: font.style }}
                        onClick={() => handleSetFontFamily(font.value)}
                      >
                        <span>{font.label}</span>
                        {currentFontFamily === font.value && (
                          <span className="text-primary text-xs">●</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Color pickers */}
        <div className="flex items-center gap-1">
          <Popover>
            {({ open }) => (
              <>
                <Popover.Button
                  ref={bgColorPickerButtonRef}
                  className="relative h-8 w-8 rounded-full cursor-pointer border-2 border-background ring-1 ring-border/30 shadow-sm hover:scale-110 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 shrink-0"
                  style={{ backgroundColor: currentBgColor }}
                />
                {open && (
                  <PopoverPanelPortal buttonRef={bgColorPickerButtonRef}>
                    <div className="flex flex-col gap-3 p-3 bg-popover rounded-xl shadow-2xl border border-border/50 animate-in fade-in zoom-in-95 duration-200 min-w-[220px]">
                      <div className="text-xs font-semibold text-muted-foreground">
                        Background
                      </div>
                      <HexColorPicker
                        color={currentBgColor}
                        onChange={handleSetBackgroundColor}
                        className="!w-full !h-32"
                      />
                      <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-md border border-border/50">
                        <div
                          className="w-5 h-5 rounded-full border border-border/20 shadow-sm shrink-0"
                          style={{ backgroundColor: currentBgColor }}
                        />
                        <Input
                          className="h-6 text-xs font-mono border-none bg-transparent focus-visible:ring-0 px-1 uppercase w-20"
                          value={currentBgColor}
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

          <Popover>
            {({ open }) => (
              <>
                <Popover.Button
                  ref={quoteColorPickerButtonRef}
                  className="relative h-8 w-8 rounded-full cursor-pointer border-2 border-background ring-1 ring-border/30 shadow-sm hover:scale-110 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 shrink-0"
                  style={{ backgroundColor: currentQuoteColor }}
                />
                {open && (
                  <PopoverPanelPortal buttonRef={quoteColorPickerButtonRef}>
                    <div className="flex flex-col gap-3 p-3 bg-popover rounded-xl shadow-2xl border border-border/50 animate-in fade-in zoom-in-95 duration-200 min-w-[220px]">
                      <div className="text-xs font-semibold text-muted-foreground">
                        Quote Color
                      </div>
                      <HexColorPicker
                        color={currentQuoteColor}
                        onChange={handleSetQuoteColor}
                        className="!w-full !h-32"
                      />
                      <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-md border border-border/50">
                        <div
                          className="w-5 h-5 rounded-full border border-border/20 shadow-sm shrink-0"
                          style={{ backgroundColor: currentQuoteColor }}
                        />
                        <Input
                          className="h-6 text-xs font-mono border-none bg-transparent focus-visible:ring-0 px-1 uppercase w-20"
                          value={currentQuoteColor}
                          onChange={(e) => handleSetQuoteColor(e.target.value)}
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                  </PopoverPanelPortal>
                )}
              </>
            )}
          </Popover>

          <Popover>
            {({ open }) => (
              <>
                <Popover.Button
                  ref={attributionColorPickerButtonRef}
                  className="relative h-8 w-8 rounded-full cursor-pointer border-2 border-background ring-1 ring-border/30 shadow-sm hover:scale-110 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 shrink-0"
                  style={{ backgroundColor: currentAttributionColor }}
                />
                {open && (
                  <PopoverPanelPortal
                    buttonRef={attributionColorPickerButtonRef}
                  >
                    <div className="flex flex-col gap-3 p-3 bg-popover rounded-xl shadow-2xl border border-border/50 animate-in fade-in zoom-in-95 duration-200 min-w-[220px]">
                      <div className="text-xs font-semibold text-muted-foreground">
                        Attribution Color
                      </div>
                      <HexColorPicker
                        color={currentAttributionColor}
                        onChange={handleSetAttributionColor}
                        className="!w-full !h-32"
                      />
                      <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-md border border-border/50">
                        <div
                          className="w-5 h-5 rounded-full border border-border/20 shadow-sm shrink-0"
                          style={{ backgroundColor: currentAttributionColor }}
                        />
                        <Input
                          className="h-6 text-xs font-mono border-none bg-transparent focus-visible:ring-0 px-1 uppercase w-20"
                          value={currentAttributionColor}
                          onChange={(e) =>
                            handleSetAttributionColor(e.target.value)
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

          <Popover>
            {({ open }) => (
              <>
                <Popover.Button
                  ref={iconColorPickerButtonRef}
                  className="relative h-8 w-8 rounded-full cursor-pointer border-2 border-background ring-1 ring-border/30 shadow-sm hover:scale-110 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 shrink-0"
                  style={{ backgroundColor: currentIconColor }}
                />
                {open && (
                  <PopoverPanelPortal buttonRef={iconColorPickerButtonRef}>
                    <div className="flex flex-col gap-3 p-3 bg-popover rounded-xl shadow-2xl border border-border/50 animate-in fade-in zoom-in-95 duration-200 min-w-[220px]">
                      <div className="text-xs font-semibold text-muted-foreground">
                        Quote Mark Color
                      </div>
                      <HexColorPicker
                        color={currentIconColor}
                        onChange={handleSetIconColor}
                        className="!w-full !h-32"
                      />
                      <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-md border border-border/50">
                        <div
                          className="w-5 h-5 rounded-full border border-border/20 shadow-sm shrink-0"
                          style={{ backgroundColor: currentIconColor }}
                        />
                        <Input
                          className="h-6 text-xs font-mono border-none bg-transparent focus-visible:ring-0 px-1 uppercase w-20"
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
        </div>
      </div>
    </ToolbarPortal>
  );
};
