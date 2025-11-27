import { useCallback } from "react";
import { nanoid } from "@reduxjs/toolkit";
import type { ComparisonCardPreset } from "@/components/editor/types";
import type { ComparisonCardWidget } from "./types";
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

export const useComparisonCardCreation = () => {
  const dispatch = useAppDispatch();
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const globalTheme = useAppSelector(selectGlobalTheme);

  const ensureSlideId = useCallback(() => {
    if (!activeSlideId) {
      return null;
    }
    return activeSlideId;
  }, [activeSlideId]);

  const handleAddComparisonCard = useCallback(
    (preset: ComparisonCardPreset) => {
      const slideId = ensureSlideId();
      if (!slideId) return;

      const id = `comparison-card-${nanoid(8)}`;
      const width = 640;
      const height = 360;
      const originX = Math.max(
        60,
        Math.round((SLIDE_DIMENSIONS.width - width) / 2)
      );
      const originY = Math.round((SLIDE_DIMENSIONS.height - height) / 2);

      const newWidget: ComparisonCardWidget = {
        id,
        type: "comparisonCard",
        x: originX,
        y: originY,
        width,
        height,
        // Don't set colors - will use global theme by default
        backgroundColor: undefined,
        backgroundType: globalTheme?.cardBackgroundType ?? "glass",
        dividerColor: "rgba(15,23,42,0.12)", // Keep divider color as it's structural
        textAlign: "left",
        leftLabel: preset.leftLabel ?? "Plan A",
        rightLabel: preset.rightLabel ?? "Plan B",
        leftTitle: preset.leftTitle ?? "Growth Plan",
        rightTitle: preset.rightTitle ?? "Competitor",
        leftItems:
          preset.leftItems && preset.leftItems.length > 0
            ? preset.leftItems
            : ["Unlimited projects", "Priority support", "Advanced analytics"],
        rightItems:
          preset.rightItems && preset.rightItems.length > 0
            ? preset.rightItems
            : ["Limited projects", "Standard support", "Basic analytics"],
        leftAccentColor: preset.leftAccentColor ?? undefined,
        rightAccentColor: preset.rightAccentColor ?? undefined,
        leftTextColor: undefined,
        rightTextColor: undefined,
        leftLabelFontFamily:
          globalTheme?.font ??
          "var(--font-great-vibes), 'Great Vibes', cursive",
        rightLabelFontFamily:
          globalTheme?.font ??
          "var(--font-great-vibes), 'Great Vibes', cursive",
        leftTitleFontFamily:
          globalTheme?.font ?? "var(--font-montserrat), Montserrat, sans-serif",
        rightTitleFontFamily:
          globalTheme?.font ?? "var(--font-montserrat), Montserrat, sans-serif",
        leftItemFontFamily:
          globalTheme?.font ?? "var(--font-inter), Inter, sans-serif",
        rightItemFontFamily:
          globalTheme?.font ?? "var(--font-inter), Inter, sans-serif",
        leftLabelFontSize: 13,
        rightLabelFontSize: 13,
        leftTitleFontSize: 30,
        rightTitleFontSize: 30,
        leftItemFontSize: 18,
        rightItemFontSize: 18,
      };

      dispatch(addWidget({ widget: newWidget, slideId }));
      dispatch(selectWidgetAction(newWidget.id));
      dispatch(stopWidgetEditingAction());
    },
    [dispatch, ensureSlideId, globalTheme]
  );

  return {
    handleAddComparisonCard,
  };
};
