import { useCallback } from "react";
import { nanoid } from "@reduxjs/toolkit";
import type { LabelCardPreset } from "@/components/editor/types";
import type { LabelCardWidget } from "./types";
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

export const useLabelCardCreation = () => {
  const dispatch = useAppDispatch();
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const globalTheme = useAppSelector(selectGlobalTheme);

  const ensureSlideId = useCallback(() => {
    if (!activeSlideId) {
      return null;
    }
    return activeSlideId;
  }, [activeSlideId]);

  const handleAddLabelCard = useCallback(
    (preset: LabelCardPreset) => {
      const slideId = ensureSlideId();
      if (!slideId) return;
      const id = `label-card-${nanoid(8)}`;
      const width = 420;
      const height = 210;
      const originX = Math.max(
        60,
        Math.round((SLIDE_DIMENSIONS.width - width) / 2)
      );
      const originY = Math.round((SLIDE_DIMENSIONS.height - height) / 2);

      const newWidget: LabelCardWidget = {
        id,
        type: "labelCard",
        label: preset.label,
        title: preset.title,
        description: preset.description,
        x: originX,
        y: originY,
        width,
        height,
        // Don't set colors - will use global theme by default
        backgroundColor: undefined,
        labelColor: undefined,
        labelTextColor: "#ffffff", // Keep this as it's a fixed contrast color
        titleColor: undefined,
        descriptionColor: undefined,
        labelFontSize: 13,
        titleFontSize: 40,
        descriptionFontSize: 20,
        labelFontFamily:
          globalTheme?.font ??
          "var(--font-great-vibes), 'Great Vibes', cursive",
        titleFontFamily:
          globalTheme?.font ??
          "var(--font-playfair), 'Playfair Display', serif",
        descriptionFontFamily:
          globalTheme?.font ?? "var(--font-inter), Inter, sans-serif",
        textAlign: "left",
        backgroundType: globalTheme?.cardBackgroundType ?? "glass",
      };

      dispatch(addWidget({ widget: newWidget, slideId }));
      dispatch(selectWidgetAction(newWidget.id));
      dispatch(stopWidgetEditingAction());
    },
    [dispatch, ensureSlideId, globalTheme]
  );

  return {
    handleAddLabelCard,
  };
};
