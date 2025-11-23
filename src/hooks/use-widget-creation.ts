import { useCallback } from "react";
import { nanoid } from "@reduxjs/toolkit";
import type {
  TextPreset,
  ShapePreset,
} from "@/components/editor/editor-toolbar";
import type {
  TextWidget,
  SlideWidget,
} from "@/components/editor/widgets/types";
import type {
  RectangleWidget,
  CircleWidget,
  PolygonWidget,
  ArrowWidget,
} from "@/components/editor/widgets/shape/types";
import { useListCardCreation } from "@/components/editor/widgets/list-card/use-list-card-creation";
import { useIconCardCreation } from "@/components/editor/widgets/icon-card/use-icon-card-creation";
import { useLabelCardCreation } from "@/components/editor/widgets/label-card/use-label-card-creation";
import { useNumberCardCreation } from "@/components/editor/widgets/number-card/use-number-card-creation";
import {
  TEXT_PRESET_CONFIG,
  SHAPE_PRESET_CONFIG,
  SLIDE_DIMENSIONS,
} from "@/lib/constants/widget-presets";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addWidget,
  selectActiveSlideId,
  selectGlobalTheme,
} from "@/store/slices/slidesSlice";
import {
  selectWidget as selectWidgetAction,
  startWidgetEditing as startWidgetEditingAction,
  stopWidgetEditing as stopWidgetEditingAction,
} from "@/store/slices/editorUiSlice";

export const useWidgetCreation = () => {
  const dispatch = useAppDispatch();
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const globalTheme = useAppSelector(selectGlobalTheme);

  const ensureSlideId = useCallback(() => {
    if (!activeSlideId) {
      return null;
    }
    return activeSlideId;
  }, [activeSlideId]);

  const handleAddText = useCallback(
    (preset: TextPreset) => {
      const slideId = ensureSlideId();
      if (!slideId) return;
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
        // Seed with current theme text color so new text matches theme
        color: globalTheme?.text ?? "#0f172a",
        align: config.align,
        lineHeight: config.lineHeight,
      };

      dispatch(addWidget({ widget: newWidget, slideId }));
      dispatch(selectWidgetAction(newWidget.id));
      dispatch(startWidgetEditingAction(newWidget.id));
    },
    [dispatch, ensureSlideId, globalTheme]
  );

  const handleAddShape = useCallback(
    (preset: ShapePreset) => {
      const slideId = ensureSlideId();
      if (!slideId) return;
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
            // Use local fill only when preset is explicitly transparent;
            // otherwise fall back to theme accent color at render time.
            fill: config.fill === "transparent" ? "transparent" : undefined,
            borderRadius: config.borderRadius,
            ...(config.stroke ? { strokeWidth: config.strokeWidth ?? 4 } : {}),
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
            fill: config.fill === "transparent" ? "transparent" : undefined,
            ...(config.stroke ? { strokeWidth: config.strokeWidth ?? 4 } : {}),
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
            fill: config.fill === "transparent" ? "transparent" : undefined,
            ...(config.stroke ? { strokeWidth: config.strokeWidth ?? 4 } : {}),
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

  const { handleAddFeatureCard } = useNumberCardCreation();

  const { handleAddIconCard } = useIconCardCreation();

  const { handleAddLabelCard } = useLabelCardCreation();

  const { handleAddListCard } = useListCardCreation();

  return {
    handleAddText,
    handleAddShape,
    handleAddFeatureCard,
    handleAddIconCard,
    handleAddLabelCard,
    handleAddListCard,
  };
};
