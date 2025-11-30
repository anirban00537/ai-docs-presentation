import { useCallback } from "react";
import { nanoid } from "@reduxjs/toolkit";
import type { PricingCardPreset } from "@/components/editor/types";
import type { PricingCardWidget } from "./types";
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

export const usePricingCardCreation = () => {
  const dispatch = useAppDispatch();
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const globalTheme = useAppSelector(selectGlobalTheme);

  const ensureSlideId = useCallback(() => {
    if (!activeSlideId) {
      return null;
    }
    return activeSlideId;
  }, [activeSlideId]);

  const handleAddPricingCard = useCallback(
    (preset: PricingCardPreset) => {
      const slideId = ensureSlideId();
      if (!slideId) return;
      const id = `pricing-card-${nanoid(8)}`;
      const width = 380;
      const height = 520;
      const originX = Math.max(
        60,
        Math.round((SLIDE_DIMENSIONS.width - width) / 2)
      );
      const originY = Math.round((SLIDE_DIMENSIONS.height - height) / 2);

      const newWidget: PricingCardWidget = {
        id,
        type: "pricingCard",
        planName: preset.planName || "Plan Name",
        price: preset.price || "$0",
        period: preset.period || "/mo",
        badge: preset.badge || "",
        features: preset.features && preset.features.length > 0 ? preset.features : ["Feature one", "Feature two", "Feature three"],
        buttonText: preset.buttonText || "Get Started",
        x: originX,
        y: originY,
        width,
        height,
        // Don't set colors - will use global theme by default
        backgroundColor: undefined,
        planNameColor: undefined,
        priceColor: undefined,
        periodColor: undefined,
        badgeColor: undefined,
        badgeTextColor: "#ffffff", // Keep contrast colors
        featureColor: undefined,
        buttonColor: undefined,
        buttonTextColor: "#ffffff", // Keep contrast colors
        planNameFontSize: 28,
        priceFontSize: 48,
        periodFontSize: 18,
        badgeFontSize: 12,
        featureFontSize: 16,
        buttonFontSize: 16,
        // Don't set font families - will use global theme by default
        planNameFontFamily: undefined,
        priceFontFamily: undefined,
        periodFontFamily: undefined,
        badgeFontFamily: undefined,
        featureFontFamily: undefined,
        buttonFontFamily: undefined,
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
    handleAddPricingCard,
  };
};

