"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import * as Icons from "lucide-react";
import type { ResizeHandle } from "@/components/editor/widgets/types";
import type { QuoteWidget } from "./types";
import {
  TOOLBAR_SELECTOR,
  QUOTE_STYLES,
  ALIGN_OPTIONS,
  QUOTE_ICONS,
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

type LucideIcon = React.ComponentType<
  React.SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number }
>;

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
  const widgetRef = React.useRef<HTMLDivElement>(null);

  const [localQuote, setLocalQuote] = React.useState(widget.quote || "");
  const [localAttribution, setLocalAttribution] = React.useState(
    widget.attribution || ""
  );
  const [activeField, setActiveField] = React.useState<ActiveField>(null);

  const quoteTextareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const attributionInputRef = React.useRef<HTMLInputElement | null>(null);

  // Auto-resize textarea based on content
  React.useLayoutEffect(() => {
    const textarea = quoteTextareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [localQuote]);

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
    setLocalQuote((prev) => (prev === widget.quote ? prev : widget.quote || ""));
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
  const quoteColor = widget.quoteColor ?? "#0f172a";
  const attributionColor = widget.attributionColor ?? "#64748b";
  const iconColor = widget.iconColor ?? "#0f172a";
  const borderColor = widget.borderColor ?? "#e2e8f0";
  const quoteFontFamily = widget.quoteFontFamily ?? "var(--font-poppins)";
  const attributionFontFamily =
    widget.attributionFontFamily ?? "var(--font-poppins)";
  const textAlign = widget.textAlign ?? "left";
  const backgroundType = widget.backgroundType ?? "solid";
  const style = widget.style ?? "minimal";
  const icon = widget.icon || "Quote";
  const iconSize = widget.iconSize ?? 32;
  const isGlassBackground = backgroundType === "glass";

  // Get icon component
  const IconComponent = (Icons as Record<string, LucideIcon>)[icon] || Icons.Quote;

  // Style-specific rendering
  const renderQuote = () => {
    const baseQuoteClasses = cn(
      "w-full resize-none border-none bg-transparent p-0 outline-none focus:ring-0 overflow-hidden",
      isSelected ? "cursor-text" : "cursor-default"
    );

    const quoteStyle: React.CSSProperties = {
      fontFamily: quoteFontFamily,
      color: quoteColor,
      textAlign,
      wordWrap: "break-word",
      overflowWrap: "break-word",
      lineHeight: style === "bold" ? 1.2 : 1.4,
      fontSize: style === "bold" ? "2.5rem" : "1.75rem",
      fontWeight: style === "bold" ? 700 : 500,
    };

    if (style === "bordered") {
      return (
        <div className="relative">
          <div
            className="absolute left-0 top-0 h-full w-1 rounded-full"
            style={{ backgroundColor: iconColor }}
          />
          <div className="pl-6">
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
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              onFocus={() => {
                if (!isSelected) return;
                handleFieldFocus("quote");
              }}
              onBlur={() => handleFieldBlur("quote")}
              onKeyDown={(e) => handleFieldKeyDown("quote", e)}
              placeholder="Enter your quote here..."
            />
          </div>
        </div>
      );
    }

    return (
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
          e.target.style.height = "auto";
          e.target.style.height = `${e.target.scrollHeight}px`;
        }}
        onFocus={() => {
          if (!isSelected) return;
          handleFieldFocus("quote");
        }}
        onBlur={() => handleFieldBlur("quote")}
        onKeyDown={(e) => handleFieldKeyDown("quote", e)}
        placeholder="Enter your quote here..."
      />
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
      <div className="canvas-element__content relative flex h-full w-full items-stretch justify-stretch rounded">
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
            "relative h-full w-full transition-all duration-300 ease-out",
            style === "bordered"
              ? "rounded-lg border-2 p-8"
              : style === "bold"
              ? "rounded-[32px] p-10"
              : "rounded-xl p-8",
            isGlassBackground && "backdrop-blur-2xl border border-white/10 shadow-2xl"
          )}
          style={{
            backgroundColor: isGlassBackground
              ? `${backgroundColor}03`
              : backgroundColor,
            borderColor: style === "bordered" ? borderColor : undefined,
            backgroundImage: isGlassBackground
              ? "linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.02) 100%)"
              : undefined,
            boxShadow: isGlassBackground
              ? "inset 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 0 rgba(255, 255, 255, 0.25), 0 8px 32px -8px rgba(0, 0, 0, 0.1)"
              : style === "bold"
              ? "0 12px 40px -12px rgba(0, 0, 0, 0.15)"
              : undefined,
          }}
        >
          <div className="flex h-full flex-col gap-4" style={{ textAlign }}>
            {/* Icon (optional, shown for minimal and bold styles) */}
            {(style === "minimal" || style === "bold") && icon && (
              <div
                className="flex"
                style={{
                  justifyContent:
                    textAlign === "center"
                      ? "center"
                      : textAlign === "right"
                      ? "flex-end"
                      : "flex-start",
                }}
              >
                <IconComponent
                  size={iconSize}
                  strokeWidth={style === "bold" ? 2.5 : 2}
                  style={{ color: iconColor }}
                />
              </div>
            )}

            {/* Quote text */}
            {renderQuote()}

            {/* Attribution */}
            {localAttribution && (
              <div
                className="flex"
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
                    fontSize: "0.875rem",
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
  isEditing,
  activeField,
  widgetRef,
  viewport,
  containerRef,
}) => {
  const bgColorPickerButtonRef = React.useRef<HTMLButtonElement>(null);
  const quoteColorPickerButtonRef = React.useRef<HTMLButtonElement>(null);
  const attributionColorPickerButtonRef = React.useRef<HTMLButtonElement>(null);
  const iconColorPickerButtonRef = React.useRef<HTMLButtonElement>(null);
  const styleButtonRef = React.useRef<HTMLButtonElement>(null);
  const iconButtonRef = React.useRef<HTMLButtonElement>(null);
  const styleMenuRef = React.useRef<HTMLDivElement>(null);
  const iconMenuRef = React.useRef<HTMLDivElement>(null);
  const [styleMenuOpen, setStyleMenuOpen] = React.useState(false);
  const [iconMenuOpen, setIconMenuOpen] = React.useState(false);
  const [iconSearch, setIconSearch] = React.useState("");
  const dispatch = useAppDispatch();
  const activeSlideId = useAppSelector(selectActiveSlideId);

  // Close menus when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        styleMenuOpen &&
        styleMenuRef.current &&
        !styleMenuRef.current.contains(target) &&
        styleButtonRef.current &&
        !styleButtonRef.current.contains(target)
      ) {
        setStyleMenuOpen(false);
      }

      if (
        iconMenuOpen &&
        iconMenuRef.current &&
        !iconMenuRef.current.contains(target) &&
        iconButtonRef.current &&
        !iconButtonRef.current.contains(target)
      ) {
        setIconMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [styleMenuOpen, iconMenuOpen]);

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

  const handleSetStyle = (style: QuoteWidget["style"]) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { style },
      })
    );
    setStyleMenuOpen(false);
  };

  const handleSetIcon = (icon: string) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { icon },
      })
    );
    setIconMenuOpen(false);
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
    const nextType =
      widget.backgroundType === "glass" ? "solid" : "glass";
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { backgroundType: nextType },
      })
    );
  };

  const currentBgColor = widget.backgroundColor ?? "#ffffff";
  const currentQuoteColor = widget.quoteColor ?? "#0f172a";
  const currentAttributionColor = widget.attributionColor ?? "#64748b";
  const currentIconColor = widget.iconColor ?? "#0f172a";
  const currentStyle = widget.style ?? "minimal";
  const currentIcon = widget.icon || "Quote";

  const filteredIcons = QUOTE_ICONS.filter((iconName) =>
    iconName.toLowerCase().includes(iconSearch.toLowerCase())
  );

  const IconComponent = (Icons as Record<string, LucideIcon>)[currentIcon] || Icons.Quote;

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
        {/* Style selector */}
        <div className="relative" ref={styleMenuRef}>
          <Button
            ref={styleButtonRef}
            variant="outline"
            size="sm"
            className="min-w-[100px] justify-between px-3 py-1 text-xs font-medium"
            onClick={() => setStyleMenuOpen((prev) => !prev)}
          >
            {QUOTE_STYLES.find((s) => s.value === currentStyle)?.label || "Minimal"}
            <ChevronDown
              className={cn(
                "ml-2 h-3 w-3 transition-transform",
                styleMenuOpen ? "rotate-180" : "rotate-0"
              )}
            />
          </Button>
          {styleMenuOpen && (
            <div className="absolute left-0 top-full z-40 mt-1 w-48 overflow-hidden rounded-md border border-border bg-white shadow-lg">
              {QUOTE_STYLES.map((styleOption) => (
                <button
                  key={styleOption.value}
                  type="button"
                  className={cn(
                    "block w-full px-3 py-2 text-left text-xs hover:bg-accent",
                    currentStyle === styleOption.value && "bg-accent"
                  )}
                  onClick={() => handleSetStyle(styleOption.value)}
                >
                  <div className="font-medium">{styleOption.label}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {styleOption.description}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Icon selector */}
        <div className="relative" ref={iconMenuRef}>
          <Button
            ref={iconButtonRef}
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setIconMenuOpen((prev) => !prev)}
            title="Select icon"
          >
            <IconComponent className="h-4 w-4" />
          </Button>
          {iconMenuOpen && (
            <div className="absolute left-0 top-full z-40 mt-1 w-64 overflow-hidden rounded-md border border-border bg-white shadow-lg">
              <div className="p-2">
                <div className="relative">
                  <SearchIcon className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="h-8 pl-8 pr-2 text-xs"
                    placeholder="Search icons..."
                    value={iconSearch}
                    onChange={(e) => setIconSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto p-2">
                <div className="grid grid-cols-4 gap-2">
                  {filteredIcons.map((iconName) => {
                    const Icon = (Icons as Record<string, LucideIcon>)[iconName] || Icons.Quote;
                    return (
                      <button
                        key={iconName}
                        type="button"
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-md border transition-colors hover:bg-accent",
                          currentIcon === iconName && "border-primary bg-primary/10"
                        )}
                        onClick={() => handleSetIcon(iconName)}
                        title={iconName}
                      >
                        <Icon className="h-4 w-4" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

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
                          onChange={(e) => handleSetBackgroundColor(e.target.value)}
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
                  <PopoverPanelPortal buttonRef={attributionColorPickerButtonRef}>
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
                          onChange={(e) => handleSetAttributionColor(e.target.value)}
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
                        Icon Color
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

