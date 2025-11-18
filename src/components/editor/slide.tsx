"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { TextElementNode } from "@/components/editor/slide/text-element-node";
import { ShapeElementNode } from "@/components/editor/slide/shape-element-node";
import type {
  SlideElement,
  SlideElementUpdate,
  TextElement,
  RectangleElement,
  CircleElement,
  ArrowElement,
  PolygonElement,
  ResizeHandle,
} from "@/components/editor/slide/types";
import type { SlideModel } from "@/store/slices/slidesSlice";
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
  liveOverrides: Record<string, SlideElementUpdate>;
  onSelectElement: (elementId: string | null) => void;
  onSetLiveOverride: (elementId: string, updates: SlideElementUpdate) => void;
  onClearLiveOverride: (elementId: string) => void;
  scale?: number; // Optional fixed scale for thumbnails/previews
};

const Slide: React.FC<SlideProps> = ({
  slide,
  selectedId,
  editingId,
  liveOverrides,
  onSelectElement,
  onSetLiveOverride,
  onClearLiveOverride,
  scale: fixedScale,
}) => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragLayerRef = useRef<HTMLDivElement>(null);
  const readLayerRef = useRef<HTMLDivElement>(null);
  const editingTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Use the canvas viewport hook for viewport calculation and coordinate transformation
  const { viewport, screenToSlide, invScale } = useCanvasViewport(
    canvasContainerRef,
    fixedScale
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

  const createDragPointerDown = useCallback(
    (
      element: SlideElement,
      effective: SlideElement,
      isSelected: boolean,
      isEditing: boolean
    ) =>
      (event: React.PointerEvent<HTMLDivElement>) => {
        event.stopPropagation();
        if (event.detail > 1) {
          return;
        }
        if (!isSelected) {
          onSelectElement(element.id);
        }
        if (isEditing) {
          return;
        }
        beginDrag(element, effective, event);
      },
    [beginDrag, onSelectElement]
  );

  const createResizePointerDown = useCallback(
    (element: SlideElement, effective: SlideElement, handle: ResizeHandle) =>
      (event: React.PointerEvent<HTMLDivElement>) => {
        beginResize(element, effective, handle, event);
      },
    [beginResize]
  );

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
              style={{
                width: `${SLIDE_WIDTH}px`,
                height: `${SLIDE_HEIGHT}px`,
                position: "relative",
                transform: `scale(${viewport.scale})`,
                transformOrigin: "0 0",
                // @ts-expect-error - CSS custom property
                "--inv-scale": invScale,
              }}
            >
              <div
                className={cn(
                  "slide editable theme-background",
                  "relative overflow-hidden bg-white transition-[box-shadow,border] duration-300 ease-out border border-slate-200/70",
                  "shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)]"
                )}
                data-slide-index="0"
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
                    : slide.backgroundType === "gradient" &&
                      slide.backgroundGradient &&
                      slide.backgroundGradient.length > 0
                      ? {
                        background: `linear-gradient(${slide.backgroundGradientDirection || "to bottom"
                          }, ${slide.backgroundGradient.join(", ")})`,
                      }
                      : {
                        backgroundColor: slide.backgroundColor || "#ffffff",
                      }),
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

                {slide.elements.length === 0 && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="rounded-full bg-white/80 px-4 py-2 text-sm text-muted-foreground shadow-sm">
                      Use the toolbar to add content to this slide.
                    </span>
                  </div>
                )}

                {slide.elements.map((element, index) => {
                  const isSelected = selectedId === element.id;
                  const isEditing = editingId === element.id;
                  const override = liveOverrides[element.id];
                  const effective = override
                    ? ({ ...element, ...override } as SlideElement)
                    : element;

                  // Use simple z-index based on array order
                  // This ensures strict layer stacking (last in array = top)
                  const baseZIndex = 100 + index;

                  if (effective.type === "text") {
                    return (
                      <TextElementNode
                        key={element.id}
                        element={effective as TextElement}
                        isSelected={isSelected}
                        isEditing={isEditing}
                        baseZIndex={baseZIndex}
                        onPointerDown={createDragPointerDown(
                          element,
                          effective,
                          isSelected,
                          isEditing
                        )}
                        getResizePointerDown={(handle) =>
                          createResizePointerDown(element, effective, handle)
                        }
                        editingTextareaRef={editingTextareaRef}
                      />
                    );
                  }

                  return (
                    <ShapeElementNode
                      key={element.id}
                      element={
                        effective as
                        | RectangleElement
                        | CircleElement
                        | ArrowElement
                        | PolygonElement
                      }
                      isSelected={isSelected}
                      isEditing={isEditing}
                      baseZIndex={baseZIndex}
                      onPointerDown={createDragPointerDown(
                        element,
                        effective,
                        isSelected,
                        isEditing
                      )}
                      getResizePointerDown={(handle) =>
                        createResizePointerDown(element, effective, handle)
                      }
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
