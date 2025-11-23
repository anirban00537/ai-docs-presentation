"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AlignCenter, AlignLeft, AlignRight, ChevronDown } from "lucide-react";
import type {
  NumberCardWidget,
  ResizeHandle,
} from "@/components/editor/widgets/types";
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
import { X } from "lucide-react";

type NumberCardWidgetNodeProps = {
  widget: NumberCardWidget;
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

type ActiveField = "number" | "title" | "description" | null;

const TOOLBAR_SELECTOR = '[data-number-card-toolbar="true"]';

const BACKGROUND_COLORS = [
  "#ffffff", // white
  "#f8fafc", // slate-50
  "#f1f5f9", // slate-100
  "#e2e8f0", // slate-200
  "#cbd5e1", // slate-300
  "#94a3b8", // slate-400
  "#64748b", // slate-500
  "#475569", // slate-600
  "#334155", // slate-700
  "#1e293b", // slate-800
  "#0f172a", // slate-900
  "#ef4444", // red-500
  "#f97316", // orange-500
  "#facc15", // yellow-500
  "#22c55e", // green-500
  "#0ea5e9", // sky-500
  "#6366f1", // indigo-500
  "#a855f7", // purple-500
  "#ec4899", // pink-500
];

const ALIGN_OPTIONS: Array<{
  value: "left" | "center" | "right";
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
}> = [
  { value: "left", icon: AlignLeft, label: "Align left" },
  { value: "center", icon: AlignCenter, label: "Align center" },
  { value: "right", icon: AlignRight, label: "Align right" },
];

const NumberCardWidgetNodeBase: React.FC<NumberCardWidgetNodeProps> = ({
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

  const [localNumber, setLocalNumber] = React.useState(widget.number || "01");
  const [localTitle, setLocalTitle] = React.useState(widget.title || "");
  const [localDescription, setLocalDescription] = React.useState(
    widget.description || ""
  );
  const [activeField, setActiveField] = React.useState<ActiveField>(null);

  const numberInputRef = React.useRef<HTMLInputElement | null>(null);
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

  const debouncedUpdateNumber = useDebouncedCallback((value: string) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { number: value },
      })
    );
  }, 250);

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
    setLocalNumber((prev) =>
      prev === widget.number ? prev : widget.number || "01"
    );
  }, [widget.number]);

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
      debouncedUpdateNumber.flush();
      debouncedUpdateTitle.flush();
      debouncedUpdateDescription.flush();
    };
  }, [debouncedUpdateNumber, debouncedUpdateTitle, debouncedUpdateDescription]);

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
      if (field === "number") {
        debouncedUpdateNumber.flush();
      } else if (field === "title") {
        debouncedUpdateTitle.flush();
      } else if (field === "description") {
        debouncedUpdateDescription.flush();
      }
    },
    [debouncedUpdateNumber, debouncedUpdateTitle, debouncedUpdateDescription]
  );

  const handleFieldKeyDown = React.useCallback(
    (field: ActiveField, event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (field === "number") {
          debouncedUpdateNumber.flush();
        } else if (field === "title") {
          debouncedUpdateTitle.flush();
        } else if (field === "description") {
          debouncedUpdateDescription.flush();
        }
        // Blur the field
        if (field === "number" && numberInputRef.current) {
          numberInputRef.current.blur();
        } else if (field === "title" && titleInputRef.current) {
          titleInputRef.current.blur();
        } else if (field === "description" && descriptionTextareaRef.current) {
          descriptionTextareaRef.current.blur();
        }
      }
    },
    [debouncedUpdateNumber, debouncedUpdateTitle, debouncedUpdateDescription]
  );

  // Widget-local colors with sensible defaults
  const backgroundColor = widget.backgroundColor ?? "#ffffff";
  const numberColor = widget.numberColor ?? "#0f172a";
  const titleColor = widget.titleColor ?? "#0f172a";
  const descriptionColor = widget.descriptionColor ?? "#475569";
  const textAlign = widget.textAlign ?? "left";

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
          <NumberCardEditingToolbar
            widget={widget}
            isEditing={isEditing}
            activeField={activeField}
            widgetRef={widgetRef}
            viewport={viewport}
            containerRef={containerRef}
          />
        )}
        <div
          className="relative h-full w-full rounded-lg p-6"
          style={{
            backgroundColor,
          }}
        >
          <div className="flex h-full flex-col gap-3" style={{ textAlign }}>
            {/* Number field */}
            <input
              ref={numberInputRef}
              type="text"
              className="w-full resize-none border-none bg-transparent p-0 outline-none focus:ring-0 cursor-text"
              style={{
                fontSize: "2.5rem",
                fontWeight: 700,
                color: numberColor,
                lineHeight: 1,
              }}
              value={localNumber}
              onChange={(e) => {
                setLocalNumber(e.target.value);
                debouncedUpdateNumber(e.target.value);
              }}
              onFocus={() => handleFieldFocus("number")}
              onBlur={() => handleFieldBlur("number")}
              onKeyDown={(e) => handleFieldKeyDown("number", e)}
              placeholder="01"
            />

            {/* Title field */}
            <input
              ref={titleInputRef}
              type="text"
              className="w-full resize-none border-none bg-transparent p-0 outline-none focus:ring-0 cursor-text"
              style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                color: titleColor,
                lineHeight: 1.25,
              }}
              value={localTitle}
              onChange={(e) => {
                setLocalTitle(e.target.value);
                debouncedUpdateTitle(e.target.value);
              }}
              onFocus={() => handleFieldFocus("title")}
              onBlur={() => handleFieldBlur("title")}
              onKeyDown={(e) => handleFieldKeyDown("title", e)}
              placeholder="Feature Title"
            />

            {/* Description field */}
            <textarea
              ref={descriptionTextareaRef}
              className="w-full resize-none border-none bg-transparent p-0 outline-none focus:ring-0 cursor-text overflow-hidden"
              style={{
                fontSize: "0.875rem",
                color: descriptionColor,
                lineHeight: 1.5,
                wordWrap: "break-word",
                overflowWrap: "break-word",
                minHeight: "3rem",
                overflow: "hidden",
              }}
              value={localDescription}
              onChange={(e) => {
                setLocalDescription(e.target.value);
                debouncedUpdateDescription(e.target.value);
                // Auto-resize on change
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              onFocus={() => handleFieldFocus("description")}
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

export const NumberCardWidgetNode = React.memo(NumberCardWidgetNodeBase);

type NumberCardEditingToolbarProps = {
  widget: NumberCardWidget;
  isEditing: boolean;
  activeField: ActiveField;
  widgetRef: React.RefObject<HTMLElement | null>;
  viewport: Viewport;
  containerRef: React.RefObject<HTMLElement | null>;
};

const NumberCardEditingToolbar: React.FC<NumberCardEditingToolbarProps> = ({
  widget,
  isEditing,
  activeField,
  widgetRef,
  viewport,
  containerRef,
}) => {
  const bgColorPickerButtonRef = React.useRef<HTMLButtonElement>(null);
  const textColorPickerButtonRef = React.useRef<HTMLButtonElement>(null);
  const presetButtonRef = React.useRef<HTMLButtonElement>(null);
  const textPresetButtonRef = React.useRef<HTMLButtonElement>(null);
  const [presetMenuOpen, setPresetMenuOpen] = React.useState(false);
  const [textPresetMenuOpen, setTextPresetMenuOpen] = React.useState(false);
  const dispatch = useAppDispatch();
  const activeSlideId = useAppSelector(selectActiveSlideId);

  const handleSetBackgroundColor = (color: string) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { backgroundColor: color },
      })
    );
  };

  const handleSetTextColor = (color: string) => {
    if (!activeField) return;

    const colorKey =
      activeField === "number"
        ? "numberColor"
        : activeField === "title"
        ? "titleColor"
        : "descriptionColor";

    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { [colorKey]: color },
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

  const currentTextColor =
    activeField === "number"
      ? widget.numberColor ?? "#0f172a"
      : activeField === "title"
      ? widget.titleColor ?? "#0f172a"
      : activeField === "description"
      ? widget.descriptionColor ?? "#475569"
      : "#0f172a";

  return (
    <ToolbarPortal
      widgetRef={widgetRef}
      viewport={viewport}
      containerRef={containerRef}
      placement={isEditing ? "bottom" : "top"}
      offset={isEditing ? 8 : 16}
    >
      <div
        data-number-card-toolbar="true"
        className="pointer-events-auto flex items-center gap-4 rounded-lg border border-border bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur"
        onPointerDown={(event) => {
          event.stopPropagation();
        }}
      >
        {/* Background Color Section */}
        <div className="flex items-center gap-2 border-r border-border pr-3">
          <span className="text-xs font-semibold text-muted-foreground">
            Background
          </span>
          <div className="relative flex items-center gap-2">
            <Popover>
              {({ open }) => (
                <>
                  <Popover.Button
                    ref={bgColorPickerButtonRef}
                    className="relative w-8 h-8 rounded-full cursor-pointer border-[3px] border-background ring-1 ring-border/30 shadow-sm hover:scale-110 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 shrink-0"
                    style={{ backgroundColor: currentBackgroundColor }}
                  >
                    {currentBackgroundColor !== "#ffffff" && (
                      <span
                        className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 cursor-pointer opacity-0 group-hover/picker:opacity-100 hover:bg-destructive/90 transition-all shadow-sm scale-75 hover:scale-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetBackgroundColor("#ffffff");
                        }}
                      >
                        <X size={10} strokeWidth={3} />
                      </span>
                    )}
                  </Popover.Button>
                  {open && (
                    <PopoverPanelPortal buttonRef={bgColorPickerButtonRef}>
                      <div className="flex flex-col gap-3 p-3 bg-popover rounded-xl shadow-2xl border border-border/50 animate-in fade-in zoom-in-95 duration-200 min-w-[220px]">
                        <div className="text-xs font-semibold text-muted-foreground">
                          Background Color
                        </div>
                        <HexColorPicker
                          color={currentBackgroundColor}
                          onChange={handleSetBackgroundColor}
                          className="w-full! h-32!"
                        />
                        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-md border border-border/50">
                          <div
                            className="w-5 h-5 rounded-full border border-border/20 shadow-sm shrink-0"
                            style={{
                              backgroundColor: currentBackgroundColor,
                            }}
                          />
                          <Input
                            className="h-6 text-xs font-mono border-none bg-transparent focus-visible:ring-0 px-1 uppercase w-20"
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
            <div className="relative flex items-center">
              <Button
                ref={presetButtonRef}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 rounded-md border border-transparent px-2 py-1 text-xs"
                onClick={() => setPresetMenuOpen((prev) => !prev)}
              >
                <span className="text-[11px] font-medium text-muted-foreground">
                  Preset
                </span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
              {presetMenuOpen && (
                <ColorPopover>
                  <div className="flex flex-col gap-2">
                    <div className="text-xs font-semibold text-muted-foreground mb-2 px-1">
                      Background Presets
                    </div>
                    <div className="grid grid-cols-6 gap-1">
                      {BACKGROUND_COLORS.map((color) => (
                        <ColorChip
                          key={color}
                          color={color}
                          active={color === currentBackgroundColor}
                          onSelect={() => {
                            handleSetBackgroundColor(color);
                            setPresetMenuOpen(false);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </ColorPopover>
              )}
            </div>
          </div>
        </div>

        {/* Text Color Section - Only show when a field is active */}
        {activeField && (
          <div className="flex items-center gap-2 border-r border-border pr-3">
            <span className="text-xs font-semibold text-muted-foreground">
              Text ({activeField})
            </span>
            <div className="relative flex items-center gap-2">
              <Popover>
                {({ open }) => (
                  <>
                    <Popover.Button
                      ref={textColorPickerButtonRef}
                      className="relative w-8 h-8 rounded-full cursor-pointer border-[3px] border-background ring-1 ring-border/30 shadow-sm hover:scale-110 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 shrink-0"
                      style={{ backgroundColor: currentTextColor }}
                    />
                    {open && (
                      <PopoverPanelPortal buttonRef={textColorPickerButtonRef}>
                        <div className="flex flex-col gap-3 p-3 bg-popover rounded-xl shadow-2xl border border-border/50 animate-in fade-in zoom-in-95 duration-200 min-w-[220px]">
                          <div className="text-xs font-semibold text-muted-foreground">
                            {activeField} Color
                          </div>
                          <HexColorPicker
                            color={currentTextColor}
                            onChange={handleSetTextColor}
                            className="w-full! h-32!"
                          />
                          <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-md border border-border/50">
                            <div
                              className="w-5 h-5 rounded-full border border-border/20 shadow-sm shrink-0"
                              style={{
                                backgroundColor: currentTextColor,
                              }}
                            />
                            <Input
                              className="h-6 text-xs font-mono border-none bg-transparent focus-visible:ring-0 px-1 uppercase w-20"
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
              <div className="relative flex items-center">
                <Button
                  ref={textPresetButtonRef}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 rounded-md border border-transparent px-2 py-1 text-xs"
                  onClick={() => setTextPresetMenuOpen((prev) => !prev)}
                >
                  <span className="text-[11px] font-medium text-muted-foreground">
                    Preset
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </Button>
                {textPresetMenuOpen && (
                  <ColorPopover>
                    <div className="flex flex-col gap-2">
                      <div className="text-xs font-semibold text-muted-foreground mb-2 px-1">
                        Text Presets
                      </div>
                      <div className="grid grid-cols-6 gap-1">
                        {BACKGROUND_COLORS.map((color) => (
                          <ColorChip
                            key={color}
                            color={color}
                            active={color === currentTextColor}
                            onSelect={() => {
                              handleSetTextColor(color);
                              setTextPresetMenuOpen(false);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </ColorPopover>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Alignment Section */}
        <div className="flex items-center gap-1">
          {ALIGN_OPTIONS.map(({ value, icon: Icon, label }) => (
            <Button
              key={value}
              variant="ghost"
              size="icon-sm"
              className={cn(
                "rounded-md",
                currentAlign === value
                  ? "bg-primary/10 text-primary hover:bg-primary/10"
                  : undefined
              )}
              onClick={() => handleAlign(value)}
              aria-pressed={currentAlign === value}
              title={label}
            >
              <Icon className="h-4 w-4" />
            </Button>
          ))}
        </div>
      </div>
    </ToolbarPortal>
  );
};

type ColorChipProps = {
  color: string;
  active: boolean;
  onSelect: () => void;
};

const ColorChip: React.FC<ColorChipProps> = ({ color, active, onSelect }) => (
  <button
    type="button"
    aria-label={color}
    className={cn(
      "flex size-6 items-center justify-center rounded-full border border-transparent transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
      active ? "border-ring ring-2 ring-ring/30" : "border-border"
    )}
    onClick={onSelect}
  >
    <span
      className="block size-4 rounded-full border border-white/70"
      style={{ backgroundColor: color }}
    />
  </button>
);

const ColorPopover: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="absolute left-0 top-full mt-1 z-40 min-w-[180px] rounded-md border border-border bg-white p-3 shadow-lg">
    {children}
  </div>
);
