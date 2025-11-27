import { useCallback } from "react";
import { nanoid } from "@reduxjs/toolkit";
import type { ImageCardPreset } from "@/components/editor/types";
import type { ImageCardWidget } from "./types";
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
import { DEFAULT_IMAGE_URL } from "./constants";

export const useImageCardCreation = () => {
  const dispatch = useAppDispatch();
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const globalTheme = useAppSelector(selectGlobalTheme);

  const ensureSlideId = useCallback(() => {
    if (!activeSlideId) {
      return null;
    }
    return activeSlideId;
  }, [activeSlideId]);

  const handleAddImageCard = useCallback(
    (preset: ImageCardPreset) => {
      const slideId = ensureSlideId();
      if (!slideId) return;
      const id = `image-card-${nanoid(8)}`;
      const width = 460;
      const height = 360;
      const originX = Math.max(
        60,
        Math.round((SLIDE_DIMENSIONS.width - width) / 2)
      );
      const originY = Math.round((SLIDE_DIMENSIONS.height - height) / 2);

      const newWidget: ImageCardWidget = {
        id,
        type: "imageCard",
        title: preset.title || "Image Card",
        description: preset.description || "Add description here.",
        imageUrl: preset.imageUrl || DEFAULT_IMAGE_URL,
        imageStyle: preset.imageStyle || "hero",
        x: originX,
        y: originY,
        width,
        height,
        // Don't set colors - will use global theme by default
        backgroundColor: undefined,
        titleColor: undefined,
        descriptionColor: undefined,
        titleFontSize: 26,
        descriptionFontSize: 18,
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
    handleAddImageCard,
  };
};
