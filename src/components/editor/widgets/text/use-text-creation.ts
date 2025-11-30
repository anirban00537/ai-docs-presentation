import { useCallback } from "react";
import { nanoid } from "@reduxjs/toolkit";
import type { TextPreset } from "@/components/editor/types";
import type { TextWidget } from "./types";
import {
  TEXT_PRESET_CONFIG,
  SLIDE_DIMENSIONS,
} from "@/lib/constants/widget-presets";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addWidget,
  selectActiveSlideId,
} from "@/store/slices/slidesSlice";
import {
  selectWidget as selectWidgetAction,
  startWidgetEditing as startWidgetEditingAction,
} from "@/store/slices/editorUiSlice";

export const useTextCreation = () => {
  const dispatch = useAppDispatch();
  const activeSlideId = useAppSelector(selectActiveSlideId);

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
        // Don't set font family - will use global theme by default
        fontFamily: undefined,
        // Don't set color - will use global theme by default
        color: undefined,
        align: config.align,
        lineHeight: config.lineHeight,
      };

      dispatch(addWidget({ widget: newWidget, slideId }));
      dispatch(selectWidgetAction(newWidget.id));
      dispatch(startWidgetEditingAction(newWidget.id));
    },
    [dispatch, ensureSlideId]
  );

  return {
    handleAddText,
  };
};

