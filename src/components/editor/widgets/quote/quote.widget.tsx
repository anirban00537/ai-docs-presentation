"use client";

import React from "react";

import { Quote as QuoteIcon } from "lucide-react";
import type { ResizeHandle } from "@/components/editor/widgets/types";
import type { QuoteWidget } from "./types";
import { TOOLBAR_SELECTOR } from "./constants";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectActiveSlideId,
  selectGlobalTheme,
  updateWidget as updateWidgetAction,
} from "@/store/slices/slidesSlice";
import { useDebouncedCallback } from "use-debounce";
import type { Viewport } from "@/hooks/use-canvas-viewport";
import { ProseMirrorEditor } from "@/components/editor/prosemirror-editor";
import { WidgetToolbar } from "@/components/editor/widgets/shared/toolbar-controls/widget-toolbar";
import { FontFamilySelector } from "@/components/editor/widgets/shared/toolbar-controls/font-family-selector";
import { ALIGN_OPTIONS } from "@/components/editor/widgets/shared/toolbar-controls/constants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ToolbarControlConfig } from "@/components/editor/widgets/shared/toolbar-controls/types";
import {
  WidgetContainer,
  WidgetBackground,
  useWidgetPointerDown,
} from "@/components/editor/widgets/shared";

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
  const widgetRef = React.useRef<HTMLDivElement | null>(null);

  const [localQuote, setLocalQuote] = React.useState(widget.quote || "");
  const [localAttribution, setLocalAttribution] = React.useState(
    widget.attribution || ""
  );
  const [activeField, setActiveField] = React.useState<ActiveField>(null);

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

  const handlePointerDown = useWidgetPointerDown({
    onPointerDown,
    toolbarSelector: TOOLBAR_SELECTOR,
  });

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
        <ProseMirrorEditor
          value={localQuote}
          onChange={(value) => {
            if (!isSelected) return;
            setLocalQuote(value);
            debouncedUpdateQuote(value);
          }}
          onFocus={() => {
            if (!isSelected) return;
            handleFieldFocus("quote");
          }}
          onBlur={() => handleFieldBlur("quote")}
          placeholder="Enter your quote here..."
          readOnly={!isSelected}
          className={baseQuoteClasses}
          style={quoteStyle}
        />
        <QuoteIcon
          className="absolute bottom-0 right-0 w-12 h-12 rotate-180 opacity-20"
          style={{ color: iconColor }}
        />
      </div>
    );
  };

  const toolbar = isSelected ? (
    <QuoteEditingToolbar
      widget={widget}
      isEditing={isEditing}
      activeField={activeField}
      widgetRef={widgetRef}
      viewport={viewport}
      containerRef={containerRef}
    />
  ) : null;

  return (
    <WidgetContainer
      widgetRef={widgetRef}
      isSelected={isSelected}
      isEditing={isEditing}
      widget={widget}
      baseZIndex={baseZIndex}
      onPointerDown={handlePointerDown}
      getResizePointerDown={getResizePointerDown}
      toolbar={toolbar}
    >
      <WidgetBackground
        backgroundType={backgroundType}
        backgroundColor={backgroundColor}
        className="overflow-hidden"
      >
        <div
          ref={contentContainerRef}
          className="flex flex-col gap-5 justify-center h-full"
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
              <ProseMirrorEditor
                value={localAttribution}
                onChange={(value) => {
                  if (!isSelected) return;
                  setLocalAttribution(value);
                  debouncedUpdateAttribution(value);
                }}
                onFocus={() => {
                  if (!isSelected) return;
                  handleFieldFocus("attribution");
                }}
                onBlur={() => handleFieldBlur("attribution")}
                placeholder="— Attribution"
                readOnly={!isSelected}
                className={cn(
                  "w-auto min-w-[100px]",
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
              />
            </div>
          )}
        </div>
      </WidgetBackground>
    </WidgetContainer>
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
  const fontButtonRef = React.useRef<HTMLButtonElement>(null);
  const fontMenuRef = React.useRef<HTMLDivElement>(null);
  const [fontMenuOpen, setFontMenuOpen] = React.useState(false);
  const dispatch = useAppDispatch();
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const globalTheme = useAppSelector(selectGlobalTheme);

  // Close menu when clicking outside
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

  const handleSetBackgroundType = (type: QuoteWidget["backgroundType"]) => {
    if (type === (widget.backgroundType ?? "solid")) return;
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { backgroundType: type },
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
  };

  const currentBgColor = widget.backgroundColor ?? "#ffffff";
  const currentQuoteColor =
    widget.quoteColor ?? globalTheme?.accent ?? "#0f172a";
  const currentAttributionColor = widget.attributionColor ?? "#64748b";
  const currentIconColor = widget.iconColor ?? globalTheme?.accent ?? "#0f172a";
  const currentBackgroundType = widget.backgroundType ?? "solid";

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

  // Custom alignment controls (different styling)
  const alignmentControl = (
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
  );

  const controls: ToolbarControlConfig[] = [
    // Alignment controls (custom - different styling)
    {
      type: "custom",
      customRender: () => alignmentControl,
    },
    // Font size selector (conditional)
    {
      type: "font-size",
      config: {
        value: currentFontSize,
        onChange: handleSetFontSize,
      },
      showWhen: (field) => !!field,
    },
    // Font family selector (conditional) - custom render to use shared refs
    {
      type: "custom",
      customRender: () => {
        if (!activeField) return null;
        return (
          <FontFamilySelector
            config={{
              value: currentFontFamily,
              onChange: handleSetFontFamily,
            }}
            buttonRef={fontButtonRef}
            menuRef={fontMenuRef}
            isOpen={fontMenuOpen}
            onOpenChange={setFontMenuOpen}
          />
        );
      },
      showWhen: (field) => !!field,
    },
    // Background color picker
    {
      type: "color-picker",
      config: {
        color: currentBgColor,
        onChange: handleSetBackgroundColor,
        label: "Background",
      },
    },
    // Background type selector
    {
      type: "background-type",
      config: {
        value: currentBackgroundType,
        onChange: handleSetBackgroundType,
      },
    },
    // Quote color picker
    {
      type: "color-picker",
      config: {
        color: currentQuoteColor,
        onChange: handleSetQuoteColor,
        label: "Quote Color",
      },
    },
    // Attribution color picker
    {
      type: "color-picker",
      config: {
        color: currentAttributionColor,
        onChange: handleSetAttributionColor,
        label: "Attribution Color",
      },
    },
    // Icon color picker
    {
      type: "color-picker",
      config: {
        color: currentIconColor,
        onChange: handleSetIconColor,
        label: "Quote Mark Color",
      },
    },
  ];

  return (
    <WidgetToolbar
      widgetRef={widgetRef}
      viewport={viewport}
      containerRef={containerRef}
      isEditing={false}
      activeField={activeField}
      controls={controls}
      toolbarSelector="data-quote-toolbar"
    />
  );
};
