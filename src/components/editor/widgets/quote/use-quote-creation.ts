import { useCallback } from "react";
import { nanoid } from "@reduxjs/toolkit";
import type { QuotePreset } from "@/components/editor/types";
import type { QuoteWidget } from "./types";
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

export const useQuoteCreation = () => {
  const dispatch = useAppDispatch();
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const globalTheme = useAppSelector(selectGlobalTheme);

  const ensureSlideId = useCallback(() => {
    if (!activeSlideId) {
      return null;
    }
    return activeSlideId;
  }, [activeSlideId]);

  const handleAddQuote = useCallback(
    (preset: QuotePreset) => {
      const slideId = ensureSlideId();
      if (!slideId) return;
      const id = `quote-${nanoid(8)}`;
      const width = 420;
      const height = 264; // Default height
      const originX = Math.max(
        60,
        Math.round((SLIDE_DIMENSIONS.width - width) / 2)
      );
      const originY = Math.round((SLIDE_DIMENSIONS.height - height) / 2);

      const newWidget: QuoteWidget = {
        id,
        type: "quote",
        quote: preset.quote || "",
        attribution: preset.attribution || "",
        style: "minimal", // Enforce minimal style
        x: originX,
        y: originY,
        width,
        height,
        // Don't set colors - will use global theme by default
        backgroundColor: undefined,
        quoteColor: undefined,
        attributionColor: undefined,
        textAlign: "center", // Center by default for better look with quotes
        backgroundType: globalTheme?.cardBackgroundType ?? "glass",
        quoteFontSize: 30,
        attributionFontSize: 18,
        // Don't set font families - will use global theme by default
        quoteFontFamily: undefined,
        attributionFontFamily: undefined,
      };

      dispatch(addWidget({ widget: newWidget, slideId }));
      dispatch(selectWidgetAction(newWidget.id));
      dispatch(stopWidgetEditingAction());
    },
    [dispatch, ensureSlideId, globalTheme]
  );

  return {
    handleAddQuote,
  };
};
