"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type {
  RectangleElement,
  CircleElement,
  ArrowElement,
  PolygonElement,
  ResizeHandle,
} from "@/components/editor/slide/types";
import { ResizeHandles } from "@/components/editor/slide/resize-handles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, Minus, Plus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectActiveSlideId,
  updateElement as updateElementAction,
} from "@/store/slices/slidesSlice";

type ShapeElementNodeProps = {
  element: RectangleElement | CircleElement | ArrowElement | PolygonElement;
  isSelected: boolean;
  isEditing: boolean;
  baseZIndex: number;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  getResizePointerDown: (
    handle: ResizeHandle
  ) => (event: React.PointerEvent<HTMLDivElement>) => void;
};

const ShapeElementNodeBase: React.FC<ShapeElementNodeProps> = ({
  element,
  isSelected,
  isEditing,
  baseZIndex,
  onPointerDown,
  getResizePointerDown,
}) => {
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
    switch (element.type) {
      case "rectangle":
        return (
          <div
            className="h-full w-full"
            style={{
              backgroundColor:
                element.fill === "transparent" || element.fill === "none"
                  ? "transparent"
                  : element.fill,
              border:
                element.stroke && element.strokeWidth
                  ? `${element.strokeWidth}px solid ${element.stroke}`
                  : undefined,
              borderRadius: element.borderRadius,
            }}
          />
        );
      case "circle":
        return (
          <div
            className="h-full w-full"
            style={{
              backgroundColor:
                element.fill === "transparent" || element.fill === "none"
                  ? "transparent"
                  : element.fill,
              border:
                element.stroke && element.strokeWidth
                  ? `${element.strokeWidth}px solid ${element.stroke}`
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
              stroke={element.stroke}
              strokeWidth={element.strokeWidth}
              strokeLinecap="round"
            />
            <polygon points="160,15 190,40 160,65" fill={element.stroke} />
          </svg>
        );
      case "polygon": {
        const strokeColor =
          element.stroke ??
          (element.fill === "transparent" ? "#1f2937" : "none");
        const strokeWidth = element.strokeWidth ?? 0;
        const fillColor =
          element.fill === "none" ? "transparent" : element.fill ?? "#1f2937";
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

        switch (element.shape) {
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
      className={cn(
        "canvas-element group absolute flex select-none border border-transparent shadow-sm transition",
        isSelected && !isEditing
          ? "border-primary/70 ring-1 ring-primary/60"
          : "border-transparent",
        isEditing ? "cursor-text" : "cursor-move"
      )}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        zIndex: baseZIndex,
        borderRadius:
          element.type === "circle"
            ? "9999px"
            : element.type === "rectangle"
            ? element.borderRadius
            : undefined,
      }}
      onPointerDown={handlePointerDown}
    >
      <div className="canvas-element__content relative flex h-full w-full items-stretch justify-stretch rounded">
        {isSelected && !isEditing && <ShapeStyleToolbar element={element} />}
        {renderContent()}
        {isSelected && !isEditing && (
          <ResizeHandles getResizePointerDown={getResizePointerDown} />
        )}
      </div>
    </div>
  );
};

export const ShapeElementNode = React.memo(ShapeElementNodeBase);

const SHAPE_TOOLBAR_SELECTOR = '[data-shape-toolbar="true"]';
const DEFAULT_STROKE_COLOR = "#1f2937";
const SHAPE_FILL_COLORS = [
  "#ffffff",
  "#0f172a",
  "#ef4444",
  "#f97316",
  "#facc15",
  "#22c55e",
  "#0ea5e9",
  "#6366f1",
  "#a855f7",
  "#ec4899",
];

const SHAPE_STROKE_COLORS = [
  "#0f172a",
  "#1f2937",
  "#9ca3af",
  "#f97316",
  "#ef4444",
  "#6366f1",
  "#22c55e",
  "#0ea5e9",
  "#a855f7",
  "#ffffff",
];

type ShapeStyleToolbarProps = {
  element: RectangleElement | CircleElement | ArrowElement | PolygonElement;
};

const ShapeStyleToolbar: React.FC<ShapeStyleToolbarProps> = ({ element }) => {
  const dispatch = useAppDispatch();
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const toolbarRef = React.useRef<HTMLDivElement | null>(null);
  const [activePalette, setActivePalette] = React.useState<
    "fill" | "stroke" | null
  >(null);

  const supportsFill = element.type !== "arrow";
  const currentFill =
    element.type === "arrow" ? undefined : element.fill ?? "transparent";
  const currentStroke = element.stroke ?? undefined;
  const strokeWidth =
    typeof element.strokeWidth === "number"
      ? element.strokeWidth
      : element.type === "arrow"
      ? 8
      : 0;

  const handleSetFill = (color: string | "transparent") => {
    if (!supportsFill) return;
    dispatch(
      updateElementAction({
        slideId: activeSlideId,
        elementId: element.id,
        updates: { fill: color },
      })
    );
  };

  const handleSetStroke = (color: string | "transparent") => {
    if (color === "transparent") {
      dispatch(
        updateElementAction({
          slideId: activeSlideId,
          elementId: element.id,
          updates: { stroke: undefined, strokeWidth: 0 },
        })
      );
      return;
    }
    dispatch(
      updateElementAction({
        slideId: activeSlideId,
        elementId: element.id,
        updates: {
          stroke: color,
          strokeWidth: strokeWidth || 4,
        },
      })
    );
  };

  const handleSetStrokeWidth = (width: number) => {
    const normalized = Math.round(width);
    if (normalized <= 0) {
      dispatch(
        updateElementAction({
          slideId: activeSlideId,
          elementId: element.id,
          updates: { strokeWidth: 0, stroke: undefined },
        })
      );
      return;
    }
    dispatch(
      updateElementAction({
        slideId: activeSlideId,
        elementId: element.id,
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

  const togglePalette = (palette: "fill" | "stroke") => {
    setActivePalette((prev) => (prev === palette ? null : palette));
  };

  React.useEffect(() => {
    if (!activePalette) {
      return;
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (
        toolbarRef.current &&
        event.target instanceof Node &&
        !toolbarRef.current.contains(event.target)
      ) {
        setActivePalette(null);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activePalette]);

  return (
    <div
      data-shape-toolbar="true"
      className="pointer-events-auto absolute -top-16 left-1/2 z-30 flex -translate-x-1/2 items-center gap-4 rounded-lg border border-border bg-white/95 px-4 py-2 text-xs shadow-lg backdrop-blur"
      onPointerDown={(event) => event.stopPropagation()}
      ref={toolbarRef}
    >
      {supportsFill && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">
            Fill
          </span>
          <div className="relative flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 rounded-md border border-transparent px-2 py-1 text-xs"
              onClick={() => togglePalette("fill")}
            >
              <SwatchPreview
                color={currentFill ?? "transparent"}
                isTransparent={currentFill === "transparent"}
              />
              <span className="text-[11px] font-medium text-muted-foreground">
                {currentFill === "transparent" ? "None" : "Custom"}
              </span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
            {activePalette === "fill" && (
              <ColorPopover>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1">
                    <ColorChip
                      label="None"
                      isTransparent
                      active={currentFill === "transparent"}
                      onSelect={() => {
                        handleSetFill("transparent");
                        setActivePalette(null);
                      }}
                    />
                    {SHAPE_FILL_COLORS.map((color) => (
                      <ColorChip
                        key={color}
                        color={color}
                        active={color === currentFill}
                        onSelect={() => {
                          handleSetFill(color);
                          setActivePalette(null);
                        }}
                      />
                    ))}
                  </div>
                </div>
              </ColorPopover>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground">
          Border
        </span>
        <div className="relative flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 rounded-md border border-transparent px-2 py-1 text-xs"
            onClick={() => togglePalette("stroke")}
          >
            <SwatchPreview
              color={currentStroke ?? "transparent"}
              isTransparent={!currentStroke || strokeWidth === 0}
            />
            <span className="text-[11px] font-medium text-muted-foreground">
              {!currentStroke || strokeWidth === 0 ? "None" : "Custom"}
            </span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </Button>
          {activePalette === "stroke" && (
            <ColorPopover>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1">
                  <ColorChip
                    label="None"
                    isTransparent
                    active={!currentStroke || strokeWidth === 0}
                    onSelect={() => {
                      handleSetStroke("transparent");
                      setActivePalette(null);
                    }}
                  />
                  {SHAPE_STROKE_COLORS.map((color) => (
                    <ColorChip
                      key={color}
                      color={color}
                      active={color === currentStroke}
                      onSelect={() => {
                        handleSetStroke(color);
                        setActivePalette(null);
                      }}
                    />
                  ))}
                </div>
              </div>
            </ColorPopover>
          )}
        </div>
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
  );
};

const ColorPopover: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="absolute left-0 top-10 z-40 min-w-[180px] rounded-md border border-border bg-white p-3 shadow-lg">
    {children}
  </div>
);

type ColorChipProps = {
  color?: string;
  label?: string;
  isTransparent?: boolean;
  active: boolean;
  onSelect: () => void;
};

const ColorChip: React.FC<ColorChipProps> = ({
  color,
  label,
  isTransparent = false,
  active,
  onSelect,
}) => (
  <button
    type="button"
    aria-label={label ?? color ?? "color"}
    className={cn(
      "flex size-6 items-center justify-center rounded-full border border-transparent transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
      active ? "border-ring ring-2 ring-ring/30" : "border-border"
    )}
    onClick={onSelect}
  >
    {isTransparent ? (
      <span className="relative flex size-4 items-center justify-center rounded-full border border-border text-[10px] font-semibold text-muted-foreground">
        <span className="absolute h-[2px] w-6 rotate-45 rounded-full bg-destructive/70" />
      </span>
    ) : (
      <span
        className="block size-4 rounded-full border border-white/70"
        style={{ backgroundColor: color }}
      />
    )}
  </button>
);

const SwatchPreview: React.FC<{
  color?: string;
  isTransparent?: boolean;
}> = ({ color, isTransparent = false }) => {
  if (isTransparent) {
    return (
      <span className="relative flex size-4 items-center justify-center rounded-full border border-border/70">
        <span className="absolute h-[2px] w-4 rotate-45 rounded-full bg-destructive/70" />
      </span>
    );
  }
  return (
    <span
      className="block size-4 rounded-full border border-white/70"
      style={{ backgroundColor: color ?? "transparent" }}
    />
  );
};
