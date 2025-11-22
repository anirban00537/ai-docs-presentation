"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { TextWidgetNode } from "@/components/editor/widgets/text.widget";
import { ShapeWidgetNode } from "@/components/editor/widgets/shape.widget";
import { FeatureCardWidgetNode } from "@/components/editor/widgets/feature-card.widget";
import type {
  SlideWidget,
  SlideWidgetUpdate,
  TextWidget,
  RectangleWidget,
  CircleWidget,
  ArrowWidget,
  PolygonWidget,
  FeatureCardWidget,
  ResizeHandle,
} from "@/components/editor/widgets/types";
import type { GlobalTheme, SlideModel } from "@/store/slices/slidesSlice";
import { cn } from "@/lib/utils";
import {
  useCanvasViewport,
  SLIDE_WIDTH,
  SLIDE_HEIGHT,
} from "@/hooks/use-canvas-viewport";
import { usePointerSession } from "@/hooks/use-pointer-session";
import { useCanvasInteractions } from "@/hooks/use-canvas-interactions";

type SlideProps = {
  slide: SlideModel;
  selectedId: string | null;
  editingId: string | null;
  liveOverrides: Record<string, SlideWidgetUpdate>;
  onSelectWidget: (widgetId: string | null) => void;
  onSetLiveOverride: (widgetId: string, updates: SlideWidgetUpdate) => void;
  onClearLiveOverride: (widgetId: string) => void;
  scale?: number; // Optional fixed scale for thumbnails/previews
  padding?: number; // Optional padding for responsive scaling
  theme?: GlobalTheme;
};

const Slide: React.FC<SlideProps> = ({
  slide,
  selectedId,
  editingId,
  liveOverrides,
  onSelectWidget,
  onSetLiveOverride,
  onClearLiveOverride,
  scale: fixedScale,
  padding,
  theme,
}) => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragLayerRef = useRef<HTMLDivElement>(null);
  const readLayerRef = useRef<HTMLDivElement>(null);
  const editingTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Use the canvas viewport hook for viewport calculation and coordinate transformation
  const { viewport, screenToSlide, invScale } = useCanvasViewport(
    canvasContainerRef,
    fixedScale,
    padding
  );

  // Use pointer session hook for drag/resize operations
  const { beginDrag, beginResize } = usePointerSession({
    screenToSlide,
    onSetLiveOverride,
    onClearLiveOverride,
  });

  // Use canvas interactions hook for background clicks
  const { handleCanvasPointerDown } = useCanvasInteractions();

  useEffect(() => {
    if (editingId && editingTextareaRef.current) {
      editingTextareaRef.current.focus();
      editingTextareaRef.current.select();
    }
  }, [editingId]);

  const handleDragStart = useCallback(
    (
      widget: SlideWidget,
      effectiveWidget: SlideWidget,
      isSelected: boolean,
      isEditing: boolean,
      event: React.PointerEvent<HTMLDivElement>
    ) => {
      event.stopPropagation();
      if (event.detail > 1) {
        return;
      }
      if (!isSelected) {
        onSelectWidget(widget.id);
      }
      if (isEditing) {
        return;
      }
      beginDrag(widget, effectiveWidget, event);
    },
    [beginDrag, onSelectWidget]
  );

  const handleResizeStart = useCallback(
    (
      widget: SlideWidget,
      effectiveWidget: SlideWidget,
      handle: ResizeHandle,
      event: React.PointerEvent<HTMLDivElement>
    ) => {
      beginResize(widget, effectiveWidget, handle, event);
    },
    [beginResize]
  );

  const widgets = slide.widgets ?? [];

  return (
    <div
      ref={canvasContainerRef}
      className="flex flex-1 overflow-hidden"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      <div
        ref={canvasRef}
        className="canvas"
        id="canvas"
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <div className="selection-helper"></div>
        <div
          ref={dragLayerRef}
          className="canvas-drag-layer"
          style={{
            position: "absolute",
            left: `${viewport.translateX}px`,
            top: `${viewport.translateY}px`,
            width: `${SLIDE_WIDTH * viewport.scale}px`,
            height: `${SLIDE_HEIGHT * viewport.scale}px`,
          }}
        >
          <div
            className="area-selection-wrapper slide-picker-enabled"
            data-test-id="droppable-canvas"
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
            }}
          >
            <div
              ref={readLayerRef}
              data-test-id="slide-interaction-layer"
              data-slide-container="true"
              style={
                {
                  width: `${SLIDE_WIDTH}px`,
                  height: `${SLIDE_HEIGHT}px`,
                  position: "relative",
                  transform: `scale(${viewport.scale})`,
                  transformOrigin: "0 0",
                  "--inv-scale": invScale,
                } as React.CSSProperties
              }
            >
              <div
                className={cn(
                  "slide editable theme-background",
                  "relative overflow-hidden bg-white transition-[box-shadow,border] duration-300 ease-out border border-slate-200/70",
                  "shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)]"
                )}
                data-slide-index="0"
                role="region"
                aria-label="Slide Canvas"
                style={{
                  width: `${SLIDE_WIDTH}px`,
                  height: `${SLIDE_HEIGHT}px`,
                  position: "relative",
                  ...(slide.backgroundImage
                    ? {
                        backgroundImage: `url(${slide.backgroundImage})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                      }
                    : (() => {
                        // Normalize backgroundColor to array (handle backward compatibility with string values)
                        const bgColors = Array.isArray(slide.backgroundColor)
                          ? slide.backgroundColor
                          : slide.backgroundColor
                          ? [slide.backgroundColor]
                          : [];

                        if (bgColors.length === 0) {
                          if (theme && theme.background.length > 0) {
                            if (theme.background.length === 1) {
                              return { backgroundColor: theme.background[0] };
                            }
                            return {
                              background: `linear-gradient(to right, ${theme.background.join(
                                ", "
                              )})`,
                            };
                          }
                          return { backgroundColor: "#ffffff" };
                        }

                        if (bgColors.length === 1) {
                          return { backgroundColor: bgColors[0] };
                        }

                        return {
                          background: `linear-gradient(to right, ${bgColors.join(
                            ", "
                          )})`,
                        };
                      })()),
                }}
                onPointerDown={(e) => {
                  const target = e.target as HTMLElement;
                  if (
                    target.classList.contains("slide") ||
                    target === readLayerRef.current ||
                    (target.closest('[data-slide-container="true"]') ===
                      readLayerRef.current &&
                      target.closest(".canvas-element") === null)
                  ) {
                    handleCanvasPointerDown(e);
                  }
                }}
              >
                <div className="selection-helper slide-selection-helper"></div>

                {widgets.map((widget, index) => {
                  const isSelected = selectedId === widget.id;
                  const isEditing = editingId === widget.id;
                  const override = liveOverrides[widget.id];
                  const effective = override
                    ? ({ ...widget, ...override } as SlideWidget)
                    : widget;

                  // Use simple z-index based on array order
                  // This ensures strict layer stacking (last in array = top)
                  const baseZIndex = 100 + index;

                  if (effective.type === "text") {
                    return (
                      <TextWidgetNode
                        key={widget.id}
                        widget={effective as TextWidget}
                        isSelected={isSelected}
                        isEditing={isEditing}
                        baseZIndex={baseZIndex}
                        onPointerDown={(e) =>
                          handleDragStart(
                            widget,
                            effective,
                            isSelected,
                            isEditing,
                            e
                          )
                        }
                        getResizePointerDown={(handle) => (e) =>
                          handleResizeStart(widget, effective, handle, e)}
                        editingTextareaRef={editingTextareaRef}
                        viewport={viewport}
                        containerRef={canvasContainerRef}
                      />
                    );
                  }

                  if (effective.type === "featureCard") {
                    return (
                      <FeatureCardWidgetNode
                        key={widget.id}
                        widget={effective as FeatureCardWidget}
                        isSelected={isSelected}
                        isEditing={isEditing}
                        baseZIndex={baseZIndex}
                        onPointerDown={(e) =>
                          handleDragStart(
                            widget,
                            effective,
                            isSelected,
                            isEditing,
                            e
                          )
                        }
                        getResizePointerDown={(handle) => (e) =>
                          handleResizeStart(widget, effective, handle, e)}
                        viewport={viewport}
                        containerRef={canvasContainerRef}
                      />
                    );
                  }

                  return (
                    <ShapeWidgetNode
                      key={widget.id}
                      widget={
                        effective as
                          | RectangleWidget
                          | CircleWidget
                          | ArrowWidget
                          | PolygonWidget
                      }
                      isSelected={isSelected}
                      isEditing={isEditing}
                      baseZIndex={baseZIndex}
                      onPointerDown={(e) =>
                        handleDragStart(
                          widget,
                          effective,
                          isSelected,
                          isEditing,
                          e
                        )
                      }
                      getResizePointerDown={(handle) => (e) =>
                        handleResizeStart(widget, effective, handle, e)}
                      viewport={viewport}
                      containerRef={canvasContainerRef}
                    />
                  );
                })}
              </div>
            </div>
            <div id="edit-layer"></div>
            <div id="live-collab-layer">
              <div
                className="live-cursors"
                style={{
                  height: `${SLIDE_HEIGHT}px`,
                  width: `${SLIDE_WIDTH}px`,
                  position: "absolute",
                  top: 0,
                  left: 0,
                  pointerEvents: "none",
                }}
              ></div>
            </div>
          </div>
        </div>
        <div className="upload-indicators"></div>
      </div>
    </div>
  );
};

export default Slide;
