import { useCallback } from "react";
import { nanoid } from "@reduxjs/toolkit";
import type { TextPreset, ShapePreset, FeatureCardPreset } from "@/components/editor/editor-header";
import type {
  TextWidget,
  RectangleWidget,
  CircleWidget,
  PolygonWidget,
  ArrowWidget,
  FeatureCardWidget,
  SlideWidget,
} from "@/components/editor/widgets/types";
import {
  TEXT_PRESET_CONFIG,
  SHAPE_PRESET_CONFIG,
  SLIDE_DIMENSIONS,
} from "@/lib/constants/widget-presets";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addWidget, selectActiveSlideId } from "@/store/slices/slidesSlice";
import {
  selectWidget as selectWidgetAction,
  startWidgetEditing as startWidgetEditingAction,
  stopWidgetEditing as stopWidgetEditingAction,
} from "@/store/slices/editorUiSlice";

export const useWidgetCreation = () => {
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

      const newWidget: TextWidget = {
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

      dispatch(addWidget({ widget: newWidget, slideId }));
      dispatch(selectWidgetAction(newWidget.id));
      dispatch(startWidgetEditingAction(newWidget.id));
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

      let newWidget: SlideWidget | null = null;

      switch (config.type) {
        case "rectangle":
          newWidget = {
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
          } satisfies RectangleWidget;
          break;
        case "circle":
          newWidget = {
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
          } satisfies CircleWidget;
          break;
        case "polygon":
          newWidget = {
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
          } satisfies PolygonWidget;
          break;
        case "arrow":
          newWidget = {
            id: baseId,
            type: "arrow",
            x: centerX,
            y: centerY,
            width: config.width,
            height: config.height,
            stroke: config.stroke,
            strokeWidth: config.strokeWidth,
          } satisfies ArrowWidget;
          break;
      }

      if (!newWidget) {
        return;
      }

      dispatch(addWidget({ widget: newWidget, slideId }));
      dispatch(selectWidgetAction(newWidget.id));
      dispatch(stopWidgetEditingAction());
    },
    [dispatch, ensureSlideId]
  );

  const handleAddFeatureCard = useCallback(
    (preset: FeatureCardPreset) => {
      const slideId = ensureSlideId();
      const id = `feature-card-${nanoid(8)}`;
      const width = 480;
      const height = 280;
      const originX = Math.max(40, Math.round((SLIDE_DIMENSIONS.width - width) / 2));
      const originY = Math.round((SLIDE_DIMENSIONS.height - height) / 2);

      const newWidget: FeatureCardWidget = {
        id,
        type: "featureCard",
        number: "01",
        title: preset.title,
        description: preset.description,
        x: originX,
        y: originY,
        width,
        height,
        backgroundColor: "#374151", // gray-700
        borderColor: "#f97316", // orange-500
        numberColor: "#9ca3af", // gray-400
        titleColor: "#d1d5db", // gray-300
        descriptionColor: "#6b7280", // gray-500
      };

      dispatch(addWidget({ widget: newWidget, slideId }));
      dispatch(selectWidgetAction(newWidget.id));
      dispatch(stopWidgetEditingAction());
    },
    [dispatch, ensureSlideId]
  );

  return {
    handleAddText,
    handleAddShape,
    handleAddFeatureCard,
  };
};

