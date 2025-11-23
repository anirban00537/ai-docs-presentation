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
      const width = 350;
      const height = 280;
      const originX = Math.max(
        40,
        Math.round((SLIDE_DIMENSIONS.width - width) / 2)
      );
      const originY = Math.round((SLIDE_DIMENSIONS.height - height) / 2);

      const newWidget: QuoteWidget = {
        id,
        type: "quote",
        quote: preset.quote || "",
        attribution: preset.attribution || "",
        icon: preset.icon || "Quote",
        style: preset.style || "minimal",
        x: originX,
        y: originY,
        width,
        height,
        // Seed with current theme colors so quote matches active theme
        backgroundColor: globalTheme?.surface ?? "#ffffff",
        quoteColor: globalTheme?.text ?? "#0f172a",
        attributionColor: globalTheme?.text ?? "#64748b",
        iconColor: globalTheme?.accent ?? "#0f172a",
        iconSize: 24,
        textAlign: "left",
        backgroundType: "glass", // Default to glassmorphism
        quoteFontSize: preset.style === "bold" ? 28 : 20,
        attributionFontSize: 12,
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

