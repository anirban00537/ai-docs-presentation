"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type {
  RectangleWidget,
  CircleWidget,
  ArrowWidget,
  PolygonWidget,
  ResizeHandle,
} from "@/components/editor/widgets/types";
import { ResizeHandles } from "@/components/editor/resize-handles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectActiveSlideId,
  updateWidget as updateWidgetAction,
} from "@/store/slices/slidesSlice";
import type { Viewport } from "@/hooks/use-canvas-viewport";
import { ToolbarPortal } from "@/components/editor/toolbar-portal";
import { Popover } from "@headlessui/react";
import { PopoverPanelPortal } from "@/components/editor/background/popover-panel-portal";
import { HexColorPicker } from "react-colorful";

type ShapeWNodeProps = {
  widget: RectangleWidget | CircleWidget | ArrowWidget | PolygonWidget;
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

const ShapeWidgetNodeBase: React.FC<ShapeWNodeProps> = ({
  widget,
  isSelected,
  isEditing,
  baseZIndex,
  onPointerDown,
  getResizePointerDown,
  viewport,
  containerRef,
}) => {
  const widgetRef = React.useRef<HTMLDivElement>(null);

  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(SHAPE_TOOLBAR_SELECTOR)) {
        event.stopPropagation();
        return;
      }
      onPointerDown(event);
    },
    [onPointerDown]
  );

  const renderContent = () => {
    switch (widget.type) {
      case "rectangle":
        return (
          <div
            className="h-full w-full"
            style={{
              backgroundColor:
                widget.fill === "transparent" || widget.fill === "none"
                  ? "transparent"
                  : widget.fill || "#22c55e",
              border:
                widget.stroke && widget.strokeWidth
                  ? `${widget.strokeWidth}px solid ${widget.stroke}`
                  : undefined,
              borderRadius: widget.borderRadius,
            }}
          />
        );
      case "circle":
        return (
          <div
            className="h-full w-full"
            style={{
              backgroundColor:
                widget.fill === "transparent" || widget.fill === "none"
                  ? "transparent"
                  : widget.fill || "#22c55e",
              border:
                widget.stroke && widget.strokeWidth
                  ? `${widget.strokeWidth}px solid ${widget.stroke}`
                  : undefined,
              borderRadius: "9999px",
            }}
          />
        );
      case "arrow":
        return (
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 200 80"
            preserveAspectRatio="none"
          >
            <line
              x1="10"
              y1="40"
              x2="160"
              y2="40"
              stroke={widget.stroke ?? DEFAULT_STROKE_COLOR}
              strokeWidth={widget.strokeWidth}
              strokeLinecap="round"
            />
            <polygon
              points="160,15 190,40 160,65"
              fill={widget.stroke ?? DEFAULT_STROKE_COLOR}
            />
          </svg>
        );
      case "polygon": {
        const strokeColor =
          widget.stroke ??
          (widget.fill === "transparent" || widget.fill === "none"
            ? DEFAULT_STROKE_COLOR
            : "none");
        const strokeWidth = widget.strokeWidth ?? 0;
        const fillColor =
          widget.fill === "none" ? "transparent" : widget.fill || "#22c55e";
        const commonProps = {
          width: "100%",
          height: "100%",
          viewBox: "0 0 200 200",
          preserveAspectRatio: "none" as const,
        };
        const shared = {
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth,
          strokeLinejoin: "round" as const,
          strokeLinecap: "round" as const,
        };

        switch (widget.shape) {
          case "triangle":
            return (
              <svg {...commonProps}>
                <polygon points="100,10 190,190 10,190" {...shared} />
              </svg>
            );
          case "diamond":
            return (
              <svg {...commonProps}>
                <polygon points="100,10 190,100 100,190 10,100" {...shared} />
              </svg>
            );
          case "star":
            return (
              <svg {...commonProps}>
                <polygon
                  points="100,10 123,72 190,75 138,118 154,185 100,150 46,185 62,118 10,75 77,72"
                  {...shared}
                />
              </svg>
            );
          default:
            return null;
        }
      }
      default:
        return null;
    }
  };

  return (
    <div
      ref={widgetRef}
      className={cn(
        "canvas-element group absolute flex select-none border border-transparent shadow-sm transition",
        isSelected && !isEditing
          ? "border-primary/70 ring-1 ring-primary/60"
          : "border-transparent",
        isEditing ? "cursor-text" : "cursor-move"
      )}
      style={{
        left: widget.x,
        top: widget.y,
        width: widget.width,
        height: widget.height,
        zIndex: baseZIndex,
        borderRadius:
          widget.type === "circle"
            ? "9999px"
            : widget.type === "rectangle"
            ? widget.borderRadius
            : undefined,
      }}
      onPointerDown={handlePointerDown}
    >
      <div className="canvas-element__content relative flex h-full w-full items-stretch justify-stretch rounded">
        {isSelected && !isEditing && (
          <ShapeStyleToolbar
            widget={widget}
            widgetRef={widgetRef}
            viewport={viewport}
            containerRef={containerRef}
          />
        )}
        {renderContent()}
        {isSelected && !isEditing && (
          <ResizeHandles getResizePointerDown={getResizePointerDown} />
        )}
      </div>
    </div>
  );
};

export const ShapeWidgetNode = React.memo(ShapeWidgetNodeBase);

const SHAPE_TOOLBAR_SELECTOR = '[data-shape-toolbar="true"]';
const DEFAULT_STROKE_COLOR = "#1f2937";

type ShapeStyleToolbarProps = {
  widget: RectangleWidget | CircleWidget | ArrowWidget | PolygonWidget;
  widgetRef: React.RefObject<HTMLElement | null>;
  viewport: Viewport;
  containerRef: React.RefObject<HTMLElement | null>;
};

const ShapeStyleToolbar: React.FC<ShapeStyleToolbarProps> = ({
  widget,
  widgetRef,
  viewport,
  containerRef,
}) => {
  const dispatch = useAppDispatch();
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const toolbarRef = React.useRef<HTMLDivElement | null>(null);
  const fillColorPickerButtonRef = React.useRef<HTMLButtonElement>(null);
  const strokeColorPickerButtonRef = React.useRef<HTMLButtonElement>(null);

  const supportsFill = widget.type !== "arrow";
  const currentFill =
    widget.type === "arrow"
      ? undefined
      : widget.fill === "" || widget.fill === undefined
      ? "transparent"
      : widget.fill;
  const currentStroke = widget.stroke ?? undefined;
  const strokeWidth =
    typeof widget.strokeWidth === "number"
      ? widget.strokeWidth
      : widget.type === "arrow"
      ? 8
      : 0;

  const handleSetFill = (color: string) => {
    if (!supportsFill) return;
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { fill: color },
      })
    );
  };

  const handleRemoveFill = () => {
    if (!supportsFill) return;
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { fill: "transparent" },
      })
    );
  };

  const handleSetStroke = (color: string) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: {
          stroke: color,
          strokeWidth: strokeWidth || 4,
        },
      })
    );
  };

  const handleRemoveStroke = () => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { stroke: undefined, strokeWidth: 0 },
      })
    );
  };

  const handleSetStrokeWidth = (width: number) => {
    const normalized = Math.round(width);
    if (normalized <= 0) {
      dispatch(
        updateWidgetAction({
          slideId: activeSlideId,
          widgetId: widget.id,
          updates: { strokeWidth: 0, stroke: undefined },
        })
      );
      return;
    }
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: {
          strokeWidth: Math.min(48, normalized),
          stroke: currentStroke ?? DEFAULT_STROKE_COLOR,
        },
      })
    );
  };

  const adjustStrokeWidth = (delta: number) => {
    const next = strokeWidth + delta;
    handleSetStrokeWidth(Math.max(0, Math.min(48, next)));
  };

  const handleStrokeWidthInput = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const rawValue = event.target.value;
    if (rawValue.trim() === "") {
      return;
    }
    const value = Number(rawValue);
    if (!Number.isFinite(value)) {
      return;
    }
    handleSetStrokeWidth(value);
  };

  return (
    <ToolbarPortal
      widgetRef={widgetRef}
      viewport={viewport}
      containerRef={containerRef}
      placement="top"
      offset={16}
    >
      <div
        data-shape-toolbar="true"
        className="pointer-events-auto flex items-center gap-4 rounded-lg border border-border bg-white/95 px-4 py-2 text-xs shadow-lg backdrop-blur"
        onPointerDown={(event) => event.stopPropagation()}
        ref={toolbarRef}
      >
        {supportsFill && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Background
            </span>
            <Popover>
              {({ open }) => (
                <>
                  <Popover.Button
                    ref={fillColorPickerButtonRef}
                    className="relative w-8 h-8 rounded-full cursor-pointer border-[3px] border-background ring-1 ring-border/30 shadow-sm hover:scale-110 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 shrink-0"
                    style={{
                      backgroundColor:
                        currentFill === "transparent" || !currentFill
                          ? "#ffffff"
                          : currentFill,
                    }}
                  >
                    {currentFill !== "transparent" && currentFill && (
                      <span
                        className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 cursor-pointer opacity-0 group-hover/picker:opacity-100 hover:bg-destructive/90 transition-all shadow-sm scale-75 hover:scale-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFill();
                        }}
                      >
                        <X size={10} strokeWidth={3} />
                      </span>
                    )}
                    {currentFill === "transparent" && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="h-[2px] w-6 rotate-45 rounded-full bg-destructive/70" />
                      </span>
                    )}
                  </Popover.Button>
                  {open && (
                    <PopoverPanelPortal buttonRef={fillColorPickerButtonRef}>
                      <div className="flex flex-col gap-3 p-3 bg-popover rounded-xl shadow-2xl border border-border/50 animate-in fade-in zoom-in-95 duration-200 min-w-[220px]">
                        <div className="text-xs font-semibold text-muted-foreground">
                          Custom
                        </div>
                        <HexColorPicker
                          color={
                            currentFill === "transparent" || !currentFill
                              ? "#ffffff"
                              : currentFill
                          }
                          onChange={handleSetFill}
                          className="!w-full !h-32"
                        />
                        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-md border border-border/50">
                          <div
                            className="w-5 h-5 rounded-full border border-border/20 shadow-sm shrink-0"
                            style={{
                              backgroundColor:
                                currentFill === "transparent" || !currentFill
                                  ? "#ffffff"
                                  : currentFill,
                            }}
                          />
                          <Input
                            className="h-6 text-xs font-mono border-none bg-transparent focus-visible:ring-0 px-1 uppercase w-20"
                            value={
                              currentFill === "transparent" || !currentFill
                                ? "#ffffff"
                                : currentFill
                            }
                            onChange={(e) => handleSetFill(e.target.value)}
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
        )}

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">
            Border
          </span>
          <Popover>
            {({ open }) => (
              <>
                <Popover.Button
                  ref={strokeColorPickerButtonRef}
                  className="relative w-8 h-8 rounded-full cursor-pointer border-[3px] border-background ring-1 ring-border/30 shadow-sm hover:scale-110 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 shrink-0"
                  style={{
                    backgroundColor:
                      !currentStroke || strokeWidth === 0
                        ? "#ffffff"
                        : currentStroke,
                  }}
                >
                  {currentStroke && strokeWidth > 0 && (
                    <span
                      className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 cursor-pointer opacity-0 group-hover/picker:opacity-100 hover:bg-destructive/90 transition-all shadow-sm scale-75 hover:scale-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveStroke();
                      }}
                    >
                      <X size={10} strokeWidth={3} />
                    </span>
                  )}
                  {(!currentStroke || strokeWidth === 0) && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="h-[2px] w-6 rotate-45 rounded-full bg-destructive/70" />
                    </span>
                  )}
                </Popover.Button>
                {open && currentStroke && strokeWidth > 0 && (
                  <PopoverPanelPortal buttonRef={strokeColorPickerButtonRef}>
                    <div className="flex flex-col gap-3 p-3 bg-popover rounded-xl shadow-2xl border border-border/50 animate-in fade-in zoom-in-95 duration-200 min-w-[220px]">
                      <div className="text-xs font-semibold text-muted-foreground">
                        Custom
                      </div>
                      <HexColorPicker
                        color={currentStroke}
                        onChange={handleSetStroke}
                        className="!w-full !h-32"
                      />
                      <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-md border border-border/50">
                        <div
                          className="w-5 h-5 rounded-full border border-border/20 shadow-sm shrink-0"
                          style={{ backgroundColor: currentStroke }}
                        />
                        <Input
                          className="h-6 text-xs font-mono border-none bg-transparent focus-visible:ring-0 px-1 uppercase w-20"
                          value={currentStroke}
                          onChange={(e) => handleSetStroke(e.target.value)}
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

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">
            Width
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-md"
              onClick={() => adjustStrokeWidth(-2)}
              aria-label="Decrease border width"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              className="h-8 w-16 rounded-md text-center text-xs"
              value={strokeWidth}
              onChange={handleStrokeWidthInput}
              min={0}
              max={48}
            />
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-md"
              onClick={() => adjustStrokeWidth(2)}
              aria-label="Increase border width"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </ToolbarPortal>
  );
};
