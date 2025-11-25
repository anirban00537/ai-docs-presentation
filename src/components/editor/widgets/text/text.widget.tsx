"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  updateWidget as updateWidgetAction,
  selectActiveSlideId,
} from "@/store/slices/slidesSlice";
import {
  startWidgetEditing as startWidgetEditingAction,
  stopWidgetEditing as stopWidgetEditingAction,
} from "@/store/slices/editorUiSlice";
import type { ResizeHandle } from "@/components/editor/widgets/types";
import type { TextWidget } from "./types";
import { TOOLBAR_SELECTOR, TEXT_STYLE_PRESETS } from "./constants";
import { useDebouncedCallback } from "use-debounce";
import type { Viewport } from "@/hooks/use-canvas-viewport";
import { WidgetToolbar } from "@/components/editor/widgets/shared/toolbar-controls/widget-toolbar";
import type { ToolbarControlConfig } from "@/components/editor/widgets/shared/toolbar-controls/types";
import { PopoverPanelPortal } from "@/components/editor/background/popover-panel-portal";
import { useWidgetPointerDown } from "@/components/editor/widgets/shared";

const textResizeHandles: Array<{
  handle: Extract<ResizeHandle, "left" | "right">;
  className: string;
}> = [
  { handle: "left", className: "-left-1.5 top-1/2 -translate-y-1/2" },
  { handle: "right", className: "-right-1.5 top-1/2 -translate-y-1/2" },
];

type TextWidgetNodeProps = {
  widget: TextWidget;
  isSelected: boolean;
  isEditing: boolean;
  baseZIndex: number;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  getResizePointerDown: (
    handle: ResizeHandle
  ) => (event: React.PointerEvent<HTMLDivElement>) => void;
  editingTextareaRef: React.RefObject<HTMLTextAreaElement | null>;
  viewport: Viewport;
  containerRef: React.RefObject<HTMLElement | null>;
};

const TextWidgetNodeBase: React.FC<TextWidgetNodeProps> = ({
  widget,
  isSelected,
  isEditing,
  baseZIndex,
  onPointerDown,
  getResizePointerDown,
  editingTextareaRef,
  viewport,
  containerRef,
}) => {
  const dispatch = useAppDispatch();
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const widgetRef = React.useRef<HTMLDivElement>(null);

  const contentRef = React.useRef<HTMLDivElement | HTMLTextAreaElement | null>(
    null
  );
  const lastAppliedHeightRef = React.useRef<number>(widget.height);
  const [localText, setLocalText] = React.useState(widget.text);

  const debouncedUpdateText = useDebouncedCallback((nextText: string) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { text: nextText },
      })
    );
  }, 250);

  React.useEffect(() => {
    setLocalText((prev) => (prev === widget.text ? prev : widget.text));
  }, [widget.id, widget.text]);

  React.useEffect(() => {
    if (!isEditing) {
      debouncedUpdateText.flush();
    }
  }, [debouncedUpdateText, isEditing]);

  React.useEffect(() => {
    return () => {
      debouncedUpdateText.flush();
    };
  }, [debouncedUpdateText]);

  const setTextareaRef = React.useCallback(
    (node: HTMLTextAreaElement | null) => {
      if (editingTextareaRef) {
        editingTextareaRef.current = node;
      }
      contentRef.current = node;
    },
    [editingTextareaRef]
  );

  const setDisplayRef = React.useCallback((node: HTMLDivElement | null) => {
    contentRef.current = node;
  }, []);

  React.useEffect(() => {
    lastAppliedHeightRef.current = widget.height;
  }, [widget.height]);

  // Auto-focus textarea when entering edit mode
  React.useEffect(() => {
    if (isEditing && contentRef.current instanceof HTMLTextAreaElement) {
      contentRef.current.focus();
      // Move cursor to end of text
      const length = contentRef.current.value.length;
      contentRef.current.setSelectionRange(length, length);
    }
  }, [isEditing]);

  React.useLayoutEffect(() => {
    const node = contentRef.current;
    if (!node) {
      return;
    }

    if (node instanceof HTMLTextAreaElement) {
      node.style.height = "auto";
      node.style.height = `${node.scrollHeight}px`;
    }

    // For display divs, we need to measure the actual content height
    // which includes wrapped text when width is constrained
    const measuredHeight =
      node instanceof HTMLTextAreaElement
        ? node.scrollHeight
        : node.scrollHeight || node.offsetHeight;

    if (Number.isFinite(measuredHeight) && measuredHeight > 0) {
      const nextHeight = Math.max(1, measuredHeight);
      if (!isEditing && Math.abs(nextHeight - widget.height) > 0.5) {
        lastAppliedHeightRef.current = nextHeight;
        dispatch(
          updateWidgetAction({
            slideId: activeSlideId,
            widgetId: widget.id,
            updates: { height: nextHeight },
          })
        );
      }
    }
  }, [
    activeSlideId,
    dispatch,
    widget.align,
    widget.fontSize,
    widget.fontWeight,
    widget.height,
    widget.id,
    widget.lineHeight,
    widget.text,
    widget.width,
    isEditing,
  ]);

  const handlePointerDown = useWidgetPointerDown({
    onPointerDown: (event) => {
      if (event.detail >= 2 && !isEditing) {
        event.stopPropagation();
        dispatch(startWidgetEditingAction(widget.id));
        return;
      }
      onPointerDown(event);
    },
    toolbarSelector: TOOLBAR_SELECTOR,
  });

  return (
    <div
      ref={widgetRef}
      className={cn(
        "canvas-element group absolute flex select-none border border-transparent transition",
        isSelected && !isEditing ? "border-primary/70" : "border-transparent",
        isEditing ? "cursor-text" : "cursor-move"
      )}
      style={{
        left: widget.x,
        top: widget.y,
        width: widget.width,
        // Use minHeight + height: auto to allow text to grow naturally
        // while respecting manual vertical resizing (if larger than content)
        minHeight: widget.height,
        height: "auto",
        zIndex: baseZIndex,
      }}
      onPointerDown={handlePointerDown}
      onDoubleClick={(event) => {
        const target = event.target as HTMLElement | null;
        if (target?.closest(TOOLBAR_SELECTOR)) {
          event.stopPropagation();
          return;
        }
        event.stopPropagation();
        dispatch(startWidgetEditingAction(widget.id));
      }}
    >
      <div className="canvas-element__content relative flex h-full w-full items-stretch justify-stretch rounded">
        {isSelected && (
          <TextEditingToolbar
            widget={widget}
            isEditing={isEditing}
            widgetRef={widgetRef}
            viewport={viewport}
            containerRef={containerRef}
          />
        )}
        {isEditing ? (
          <div className="flex h-full w-full items-start pt-1 px-1">
            <textarea
              ref={setTextareaRef}
              className="w-full resize-none border-none bg-transparent p-0 text-foreground outline-none focus:ring-0"
              style={{
                fontSize: widget.fontSize,
                fontWeight: widget.fontWeight,
                color: widget.color || "#0f172a",
                textAlign: widget.align,
                lineHeight: widget.lineHeight ?? 1.3,
                wordWrap: "break-word",
                overflowWrap: "break-word",
                // Ensure textarea grows with content
                height: "100%",
                overflow: "hidden",
              }}
              value={localText}
              onChange={(event) => {
                const { value } = event.target;
                setLocalText(value);
                debouncedUpdateText(value);
              }}
              onBlur={() => {
                debouncedUpdateText.flush();
                dispatch(stopWidgetEditingAction());
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  debouncedUpdateText.flush();
                  dispatch(stopWidgetEditingAction());
                }
              }}
            />
          </div>
        ) : (
          <div className="flex h-full w-full items-start pt-1 px-1">
            <div
              ref={setDisplayRef}
              className="w-full cursor-text whitespace-pre-wrap wrap-break-word"
              style={{
                fontSize: widget.fontSize,
                fontWeight: widget.fontWeight,
                color: widget.color || "#0f172a",
                textAlign: widget.align,
                lineHeight: widget.lineHeight ?? 1.3,
                wordWrap: "break-word",
                overflowWrap: "break-word",
              }}
              onDoubleClick={(event) => {
                const target = event.target as HTMLElement | null;
                if (target?.closest(TOOLBAR_SELECTOR)) {
                  event.stopPropagation();
                  return;
                }
                event.stopPropagation();
                dispatch(startWidgetEditingAction(widget.id));
              }}
            >
              {widget.text || "Start typing…"}
            </div>
          </div>
        )}
      </div>

      {isSelected && !isEditing && (
        <>
          {textResizeHandles.map(({ handle, className }) => (
            <div
              key={handle}
              className={cn(
                "absolute h-3 w-3 rounded-sm border border-white bg-primary cursor-ew-resize z-10",
                className
              )}
              onPointerDown={getResizePointerDown(handle)}
            />
          ))}
        </>
      )}
    </div>
  );
};

export const TextWidgetNode = React.memo(TextWidgetNodeBase);

type TextEditingToolbarProps = {
  widget: TextWidget;
  isEditing: boolean;
  widgetRef: React.RefObject<HTMLElement | null>;
  viewport: Viewport;
  containerRef: React.RefObject<HTMLElement | null>;
};

const TextEditingToolbar: React.FC<TextEditingToolbarProps> = ({
  widget,
  isEditing,
  widgetRef,
  viewport,
  containerRef,
}) => {
  const [presetMenuOpen, setPresetMenuOpen] = React.useState(false);
  const presetButtonRef = React.useRef<HTMLButtonElement>(null);
  const presetMenuRef = React.useRef<HTMLDivElement | null>(null);
  const dispatch = useAppDispatch();
  const activeSlideId = useAppSelector(selectActiveSlideId);

  React.useEffect(() => {
    if (!presetMenuOpen) {
      return;
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (
        presetMenuRef.current &&
        event.target instanceof Node &&
        !presetMenuRef.current.contains(event.target) &&
        presetButtonRef.current &&
        !presetButtonRef.current.contains(event.target as Node)
      ) {
        setPresetMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [presetMenuOpen]);

  const isBold = widget.fontWeight >= 600;

  const applyPreset = React.useCallback(
    (presetId: string) => {
      const preset = TEXT_STYLE_PRESETS.find((item) => item.id === presetId);
      if (!preset) return;
      dispatch(
        updateWidgetAction({
          slideId: activeSlideId,
          widgetId: widget.id,
          updates: {
            fontSize: preset.fontSize,
            fontWeight: preset.fontWeight,
            lineHeight: preset.lineHeight,
            align: preset.align,
          },
        })
      );
      setPresetMenuOpen(false);
    },
    [activeSlideId, dispatch, widget.id]
  );

  const handleSetColor = (color: string) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { color },
      })
    );
  };

  const handleSetFontSize = (size: number) => {
    const next = Math.min(300, Math.max(8, Math.round(size)));
    if (next !== widget.fontSize) {
      dispatch(
        updateWidgetAction({
          slideId: activeSlideId,
          widgetId: widget.id,
          updates: { fontSize: next },
        })
      );
    }
  };

  const toggleBold = () => {
    const nextWeight = isBold ? 400 : 700;
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { fontWeight: nextWeight },
      })
    );
  };

  const handleAlign = (align: "left" | "center" | "right") => {
    if (align !== widget.align) {
      dispatch(
        updateWidgetAction({
          slideId: activeSlideId,
          widgetId: widget.id,
          updates: { align },
        })
      );
    }
  };

  const currentColor = widget.color || "#0f172a";

  const currentPresetLabel =
    TEXT_STYLE_PRESETS.find(
      (preset) =>
        preset.fontSize === widget.fontSize &&
        preset.fontWeight === widget.fontWeight &&
        Math.abs(preset.lineHeight - (widget.lineHeight ?? preset.lineHeight)) <
          0.01
    )?.label ?? "Custom";

  // Preset selector custom control
  const presetSelectorControl = (
    <div className="relative flex items-center" ref={presetMenuRef}>
      <Button
        ref={presetButtonRef}
        variant="outline"
        size="sm"
        className="min-w-[90px] justify-between px-3 py-1 text-xs font-medium"
        onClick={() => setPresetMenuOpen((prev) => !prev)}
      >
        {currentPresetLabel}
        <svg
          className={cn(
            "h-3 w-3 transition-transform",
            presetMenuOpen ? "rotate-180" : "rotate-0"
          )}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </Button>
      {presetMenuOpen && (
        <PopoverPanelPortal buttonRef={presetButtonRef}>
          <div className="flex flex-col gap-1 rounded-xl border border-white/20 bg-white/95 p-2 shadow-2xl backdrop-blur-xl min-w-[120px]">
            {TEXT_STYLE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className="block w-full px-3 py-2 text-left text-xs hover:bg-accent rounded-lg transition-all"
                onClick={() => applyPreset(preset.id)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </PopoverPanelPortal>
      )}
    </div>
  );

  // Bold toggle custom control
  const boldToggleControl = (
    <Button
      variant={isBold ? "default" : "ghost"}
      size="sm"
      className="rounded-md px-2 py-1 text-xs font-semibold"
      onClick={toggleBold}
      aria-pressed={isBold}
      aria-label="Toggle bold"
    >
      B
    </Button>
  );

  const controls: ToolbarControlConfig[] = [
    // Preset selector (custom)
    {
      type: "custom",
      customRender: () => presetSelectorControl,
    },
    { type: "separator" },
    // Font size selector
    {
      type: "font-size",
      config: {
        value: widget.fontSize,
        onChange: handleSetFontSize,
      },
    },
    // Bold toggle (custom)
    {
      type: "custom",
      customRender: () => boldToggleControl,
    },
    { type: "separator" },
    // Color picker
    {
      type: "color-picker",
      config: {
        color: currentColor,
        onChange: handleSetColor,
        label: "Text Color",
        showReset: true,
        resetValue: "#0f172a",
      },
    },
    { type: "separator" },
    // Alignment controls
    {
      type: "alignment",
      config: {
        value: widget.align,
        onChange: handleAlign,
      },
    },
  ];

  return (
    <WidgetToolbar
      widgetRef={widgetRef}
      viewport={viewport}
      containerRef={containerRef}
      isEditing={isEditing}
      activeField={null}
      controls={controls}
      toolbarSelector="data-text-toolbar"
    />
  );
};
