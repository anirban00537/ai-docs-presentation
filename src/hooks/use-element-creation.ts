import { useCallback } from "react";
import { nanoid } from "@reduxjs/toolkit";
import type { TextPreset, ShapePreset } from "@/components/editor/editor-header";
import type {
  TextElement,
  RectangleElement,
  CircleElement,
  PolygonElement,
  ArrowElement,
  SlideElement,
} from "@/components/editor/slide/types";
import {
  TEXT_PRESET_CONFIG,
  SHAPE_PRESET_CONFIG,
  SLIDE_DIMENSIONS,
} from "@/lib/constants/element-presets";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addElement,
  selectActiveSlideId,
} from "@/store/slices/slidesSlice";
import {
  selectElement as selectElementAction,
  startEditing as startEditingAction,
  stopEditing as stopEditingAction,
} from "@/store/slices/editorUiSlice";

export const useElementCreation = () => {
  const dispatch = useAppDispatch();
  const activeSlideId = useAppSelector(selectActiveSlideId);

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

  return {
    handleAddText,
    handleAddShape,
  };
};

