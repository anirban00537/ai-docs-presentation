"use client";

import React, { useCallback } from "react";
import { nanoid } from "@reduxjs/toolkit";
import Slide from "@/components/editor/slide";
import {
  ArrowElement,
  CircleElement,
  PolygonElement,
  PolygonShape,
  RectangleElement,
  SlideElement,
  SlideElementUpdate,
  TextElement,
} from "@/components/editor/slide/types";
import {
  EditorHeader,
  ShapePreset,
  TextPreset,
} from "@/components/editor/editor-header";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addElement,
  selectActiveSlide,
  selectActiveSlideElements,
  selectActiveSlideId,
  updateElement as updateElementAction,
} from "@/store/slices/slidesSlice";
import {
  selectElement as selectElementAction,
  selectSelectedElementId,
  selectEditingElementId,
  selectLiveOverrides,
  selectPointerSession,
  selectActivePointerId,
  startEditing as startEditingAction,
  stopEditing as stopEditingAction,
  setLiveOverride,
  clearLiveOverride,
  startPointerSession as startPointerSessionAction,
  updatePointerSession as updatePointerSessionAction,
  endPointerSession as endPointerSessionAction,
} from "@/store/slices/editorUiSlice";
import type { PointerSession } from "@/store/slices/editorUiSlice";
import { SLIDE_WIDTH, SLIDE_HEIGHT } from "@/hooks/use-canvas-viewport";

type TextPresetId = TextPreset["id"];
type ShapePresetId = ShapePreset["id"];

const SLIDE_DIMENSIONS = {
  width: SLIDE_WIDTH,
  height: SLIDE_HEIGHT,
};

const TEXT_PRESET_CONFIG: Record<
  TextPresetId,
  {
    width: number;
    height: number;
    fontSize: number;
    fontWeight: number;
    align: "left" | "center" | "right";
    lineHeight: number;
  }
> = {
  heading: {
    width: 960,
    height: 184,
    fontSize: 96,
    fontWeight: 600,
    align: "center",
    lineHeight: 1,
  },
  subheading: {
    width: 820,
    height: 140,
    fontSize: 48,
    fontWeight: 500,
    align: "center",
    lineHeight: 1.05,
  },
  body: {
    width: 720,
    height: 240,
    fontSize: 24,
    fontWeight: 400,
    align: "left",
    lineHeight: 1.4,
  },
};

const DEFAULT_SHAPE_FILL = "#1f2937";
const DEFAULT_OUTLINE_STROKE = "#1f2937";
const DEFAULT_OUTLINE_STROKE_WIDTH = 8;

const SHAPE_PRESET_CONFIG: Record<
  ShapePresetId,
  | {
      type: "rectangle";
      width: number;
      height: number;
      fill: string;
      borderRadius: number;
      stroke?: string;
      strokeWidth?: number;
    }
  | {
      type: "circle";
      width: number;
      height: number;
      fill: string;
      stroke?: string;
      strokeWidth?: number;
    }
  | {
      type: "polygon";
      width: number;
      height: number;
      shape: PolygonShape;
      fill: string;
      stroke?: string;
      strokeWidth?: number;
    }
  | {
      type: "arrow";
      width: number;
      height: number;
      stroke: string;
      strokeWidth: number;
    }
> = {
  "square-solid": {
    type: "rectangle",
    width: 220,
    height: 220,
    fill: DEFAULT_SHAPE_FILL,
    borderRadius: 4,
  },
  "rounded-square-solid": {
    type: "rectangle",
    width: 220,
    height: 220,
    fill: DEFAULT_SHAPE_FILL,
    borderRadius: 36,
  },
  "circle-solid": {
    type: "circle",
    width: 220,
    height: 220,
    fill: DEFAULT_SHAPE_FILL,
  },
  "triangle-solid": {
    type: "polygon",
    width: 240,
    height: 230,
    shape: "triangle",
    fill: DEFAULT_SHAPE_FILL,
  },
  "diamond-solid": {
    type: "polygon",
    width: 240,
    height: 240,
    shape: "diamond",
    fill: DEFAULT_SHAPE_FILL,
  },
  "star-solid": {
    type: "polygon",
    width: 260,
    height: 240,
    shape: "star",
    fill: DEFAULT_SHAPE_FILL,
  },
  "square-outline": {
    type: "rectangle",
    width: 220,
    height: 220,
    fill: "transparent",
    borderRadius: 4,
    stroke: DEFAULT_OUTLINE_STROKE,
    strokeWidth: DEFAULT_OUTLINE_STROKE_WIDTH,
  },
  "rounded-square-outline": {
    type: "rectangle",
    width: 220,
    height: 220,
    fill: "transparent",
    borderRadius: 36,
    stroke: DEFAULT_OUTLINE_STROKE,
    strokeWidth: DEFAULT_OUTLINE_STROKE_WIDTH,
  },
  "circle-outline": {
    type: "circle",
    width: 220,
    height: 220,
    fill: "transparent",
    stroke: DEFAULT_OUTLINE_STROKE,
    strokeWidth: DEFAULT_OUTLINE_STROKE_WIDTH,
  },
  "triangle-outline": {
    type: "polygon",
    width: 240,
    height: 230,
    shape: "triangle",
    fill: "transparent",
    stroke: DEFAULT_OUTLINE_STROKE,
    strokeWidth: DEFAULT_OUTLINE_STROKE_WIDTH,
  },
  "diamond-outline": {
    type: "polygon",
    width: 240,
    height: 240,
    shape: "diamond",
    fill: "transparent",
    stroke: DEFAULT_OUTLINE_STROKE,
    strokeWidth: DEFAULT_OUTLINE_STROKE_WIDTH,
  },
  "star-outline": {
    type: "polygon",
    width: 260,
    height: 240,
    shape: "star",
    fill: "transparent",
    stroke: DEFAULT_OUTLINE_STROKE,
    strokeWidth: DEFAULT_OUTLINE_STROKE_WIDTH,
  },
  arrow: {
    type: "arrow",
    width: 260,
    height: 80,
    stroke: "#14B8A6",
    strokeWidth: 8,
  },
};

const Editor = () => {
  const dispatch = useAppDispatch();
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const activeSlide = useAppSelector(selectActiveSlide);
  const selectedId = useAppSelector(selectSelectedElementId);
  const editingId = useAppSelector(selectEditingElementId);
  const liveOverrides = useAppSelector(selectLiveOverrides);
  const pointerSession = useAppSelector(selectPointerSession);
  const activePointerId = useAppSelector(selectActivePointerId);

  const ensureSlideId = useCallback(() => {
    if (!activeSlideId) {
      throw new Error("No active slide available");
    }
    return activeSlideId;
  }, [activeSlideId]);

  const handleAddText = useCallback(
    (preset: TextPreset) => {
      const slideId = ensureSlideId();
      const config = TEXT_PRESET_CONFIG[preset.id] ?? TEXT_PRESET_CONFIG.body;
      const originX = Math.max(
        40,
        Math.round((SLIDE_DIMENSIONS.width - config.width) / 2)
      );
      const originY =
        preset.id === "heading" ? 140 : preset.id === "subheading" ? 240 : 340;
      const id = `text-${nanoid(8)}`;

      const newElement: TextElement = {
        id,
        type: "text",
        text: preset.title,
        x: originX,
        y: originY,
        width: config.width,
        height: config.height,
        fontSize: config.fontSize,
        fontWeight: config.fontWeight,
        color: "#0f172a",
        align: config.align,
        lineHeight: config.lineHeight,
      };

      dispatch(addElement({ element: newElement, slideId }));
      dispatch(selectElementAction(newElement.id));
      dispatch(startEditingAction(newElement.id));
    },
    [dispatch, ensureSlideId]
  );

  const handleSelectElement = useCallback(
    (elementId: string | null) => {
      dispatch(selectElementAction(elementId));
    },
    [dispatch]
  );

  const handleStopEditing = useCallback(() => {
    dispatch(stopEditingAction());
  }, [dispatch]);

  const handleSetLiveOverride = useCallback(
    (elementId: string, updates: SlideElementUpdate) => {
      dispatch(setLiveOverride({ elementId, updates }));
    },
    [dispatch]
  );

  const handleClearLiveOverride = useCallback(
    (elementId: string) => {
      dispatch(clearLiveOverride(elementId));
    },
    [dispatch]
  );

  const handleStartPointerSession = useCallback(
    (session: PointerSession) => {
      dispatch(startPointerSessionAction(session));
    },
    [dispatch]
  );

  const handleUpdatePointerSession = useCallback(
    (updates: Partial<PointerSession>) => {
      dispatch(updatePointerSessionAction(updates));
    },
    [dispatch]
  );

  const handleEndPointerSession = useCallback(() => {
    dispatch(endPointerSessionAction());
  }, [dispatch]);

  const handleUpdateElement = useCallback(
    (payload: {
      slideId?: string;
      elementId: string;
      updates: SlideElementUpdate;
    }) => {
      dispatch(updateElementAction(payload));
    },
    [dispatch]
  );

  const handleAddShape = useCallback(
    (preset: ShapePreset) => {
      const slideId = ensureSlideId();
      const config = SHAPE_PRESET_CONFIG[preset.id];
      if (!config) return;

      const baseId = `${config.type}-${nanoid(8)}`;
      const centerX = Math.round((SLIDE_DIMENSIONS.width - config.width) / 2);
      const centerY = Math.round((SLIDE_DIMENSIONS.height - config.height) / 2);

      let newElement: SlideElement | null = null;

      switch (config.type) {
        case "rectangle":
          newElement = {
            id: baseId,
            type: "rectangle",
            x: centerX,
            y: centerY,
            width: config.width,
            height: config.height,
            fill: config.fill,
            borderRadius: config.borderRadius,
            ...(config.stroke
              ? { stroke: config.stroke, strokeWidth: config.strokeWidth ?? 4 }
              : {}),
          } satisfies RectangleElement;
          break;
        case "circle":
          newElement = {
            id: baseId,
            type: "circle",
            x: centerX,
            y: centerY,
            width: config.width,
            height: config.height,
            fill: config.fill,
            ...(config.stroke
              ? { stroke: config.stroke, strokeWidth: config.strokeWidth ?? 4 }
              : {}),
          } satisfies CircleElement;
          break;
        case "polygon":
          newElement = {
            id: baseId,
            type: "polygon",
            x: centerX,
            y: centerY,
            width: config.width,
            height: config.height,
            shape: config.shape,
            fill: config.fill,
            ...(config.stroke
              ? { stroke: config.stroke, strokeWidth: config.strokeWidth ?? 4 }
              : {}),
          } satisfies PolygonElement;
          break;
        case "arrow":
          newElement = {
            id: baseId,
            type: "arrow",
            x: centerX,
            y: centerY,
            width: config.width,
            height: config.height,
            stroke: config.stroke,
            strokeWidth: config.strokeWidth,
          } satisfies ArrowElement;
          break;
      }

      if (!newElement) {
        return;
      }

      dispatch(addElement({ element: newElement, slideId }));
      dispatch(selectElementAction(newElement.id));
      dispatch(stopEditingAction());
    },
    [dispatch, ensureSlideId]
  );

  if (!activeSlide) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center">
        <p className="text-muted-foreground">No slide selected</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col">
      <EditorHeader onAddText={handleAddText} onAddShape={handleAddShape} />
      <div className="flex flex-1 flex-col gap-4 overflow-hidden">
        <Slide
          slide={activeSlide}
          selectedId={selectedId}
          editingId={editingId}
          liveOverrides={liveOverrides}
          pointerSession={pointerSession}
          activePointerId={activePointerId}
          onSelectElement={handleSelectElement}
          onStopEditing={handleStopEditing}
          onSetLiveOverride={handleSetLiveOverride}
          onClearLiveOverride={handleClearLiveOverride}
          onStartPointerSession={handleStartPointerSession}
          onUpdatePointerSession={handleUpdatePointerSession}
          onEndPointerSession={handleEndPointerSession}
          onUpdateElement={handleUpdateElement}
        />
      </div>
    </div>
  );
};

export default Editor;
