import { useCallback } from "react";
import { nanoid } from "@reduxjs/toolkit";
import type { TitleCardPreset } from "@/components/editor/types";
import type { TitleCardWidget } from "./types";
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

export const useTitleCardCreation = () => {
  const dispatch = useAppDispatch();
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const globalTheme = useAppSelector(selectGlobalTheme);

  const ensureSlideId = useCallback(() => {
    if (!activeSlideId) {
      return null;
    }
    return activeSlideId;
  }, [activeSlideId]);

  const handleAddTitleCard = useCallback(
    (preset: TitleCardPreset) => {
      const slideId = ensureSlideId();
      if (!slideId) return;
      const id = `title-card-${nanoid(8)}`;
      const width = 900;
      const height = 420;
      const originX = Math.max(
        40,
        Math.round((SLIDE_DIMENSIONS.width - width) / 2)
      );
      const originY = Math.max(
        80,
        Math.round((SLIDE_DIMENSIONS.height - height) / 2)
      );

      const newWidget: TitleCardWidget = {
        id,
        type: "titleCard",
        eyebrow: preset.eyebrow ?? "Presentation",
        title: preset.title,
        subtitle: preset.subtitle ?? "Add a supporting subtitle",
        x: originX,
        y: originY,
        width,
        height,
        // Don't set colors - will use global theme by default
        backgroundColor: undefined,
        eyebrowColor: undefined,
        titleColor: undefined,
        subtitleColor: undefined,
        eyebrowFontFamily:
          globalTheme?.font ?? "var(--font-poppins), Poppins, sans-serif",
        titleFontFamily:
          globalTheme?.font ?? "var(--font-poppins), Poppins, sans-serif",
        subtitleFontFamily:
          globalTheme?.font ?? "var(--font-inter), Inter, sans-serif",
        eyebrowFontSize: 18,
        titleFontSize: 72,
        subtitleFontSize: 28,
        textAlign: "center",
        backgroundType: globalTheme?.cardBackgroundType ?? "glass",
      };

      dispatch(addWidget({ widget: newWidget, slideId }));
      dispatch(selectWidgetAction(newWidget.id));
      dispatch(stopWidgetEditingAction());
    },
    [dispatch, ensureSlideId, globalTheme]
  );

  return {
    handleAddTitleCard,
  };
};
