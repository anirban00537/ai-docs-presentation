import { useCallback } from "react";
import { nanoid } from "@reduxjs/toolkit";
import type { FeatureCardPreset } from "@/components/editor/types";
import type { NumberCardWidget } from "./types";
import { SLIDE_DIMENSIONS } from "@/lib/constants/widget-presets";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addWidget,
  selectActiveSlideId,
  selectGlobalTheme,
} from "@/store/slices/slidesSlice";
import {
  selectWidget as selectWidgetAction,
  stopWidgetEditing as stopWidgetEditingAction,
} from "@/store/slices/editorUiSlice";

export const useNumberCardCreation = () => {
  const dispatch = useAppDispatch();
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const globalTheme = useAppSelector(selectGlobalTheme);

  const ensureSlideId = useCallback(() => {
    if (!activeSlideId) {
      return null;
    }
    return activeSlideId;
  }, [activeSlideId]);

  const handleAddFeatureCard = useCallback(
    (preset: FeatureCardPreset) => {
      const slideId = ensureSlideId();
      if (!slideId) return;
      const id = `feature-card-${nanoid(8)}`;
      const width = 400;
      const height = 190;
      const originX = Math.max(
        40,
        Math.round((SLIDE_DIMENSIONS.width - width) / 2)
      );
      const originY = Math.round((SLIDE_DIMENSIONS.height - height) / 2);

      const newWidget: NumberCardWidget = {
        id,
        type: "numberCard",
        number: "01",
        title: preset.title,
        description: preset.description,
        x: originX,
        y: originY,
        width,
        height,
        // Seed with current theme colors so card matches active theme
        backgroundColor: globalTheme?.surface ?? "#ffffff",
        numberColor: globalTheme?.accent ?? "#0f172a",
        titleColor: globalTheme?.text ?? "#0f172a",
        descriptionColor: globalTheme?.text ?? "#475569",
        textAlign: "left",
        backgroundType: "glass", // Default to glassmorphism
      };

      dispatch(addWidget({ widget: newWidget, slideId }));
      dispatch(selectWidgetAction(newWidget.id));
      dispatch(stopWidgetEditingAction());
    },
    [dispatch, ensureSlideId, globalTheme]
  );

  return {
    handleAddFeatureCard,
  };
};

