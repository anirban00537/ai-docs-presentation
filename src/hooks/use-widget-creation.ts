import { useCallback } from "react";
import { nanoid } from "@reduxjs/toolkit";
import type { TextPreset } from "@/components/editor/types";
import type { TextWidget } from "@/components/editor/widgets/types";
import { useListCardCreation } from "@/components/editor/widgets/list-card/use-list-card-creation";
import { useIconCardCreation } from "@/components/editor/widgets/icon-card/use-icon-card-creation";
import { useLabelCardCreation } from "@/components/editor/widgets/label-card/use-label-card-creation";
import { useImageCardCreation } from "@/components/editor/widgets/image-card/use-image-card-creation";
import { useNumberCardCreation } from "@/components/editor/widgets/number-card/use-number-card-creation";
import { useQuoteCreation } from "@/components/editor/widgets/quote/use-quote-creation";
import { useComparisonCardCreation } from "@/components/editor/widgets/comparison-card/use-comparison-card-creation";
import { usePricingCardCreation } from "@/components/editor/widgets/pricing-card/use-pricing-card-creation";
import { useTitleCardCreation } from "@/components/editor/widgets/title-card/use-title-card-creation";
import {
  TEXT_PRESET_CONFIG,
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

      const themeFont = globalTheme?.font;
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
        fontFamily: themeFont ?? config.fontFamily,
        // Don't set color - will use global theme by default
        color: undefined,
        align: config.align,
        lineHeight: config.lineHeight,
      };

      dispatch(addWidget({ widget: newWidget, slideId }));
      dispatch(selectWidgetAction(newWidget.id));
      dispatch(startWidgetEditingAction(newWidget.id));
    },
    [dispatch, ensureSlideId, globalTheme]
  );

  const { handleAddFeatureCard } = useNumberCardCreation();

  const { handleAddIconCard } = useIconCardCreation();

  const { handleAddLabelCard } = useLabelCardCreation();
  const { handleAddImageCard } = useImageCardCreation();

  const { handleAddListCard } = useListCardCreation();

  const { handleAddQuote } = useQuoteCreation();
  const { handleAddComparisonCard } = useComparisonCardCreation();
  const { handleAddTitleCard } = useTitleCardCreation();
  const { handleAddPricingCard } = usePricingCardCreation();

  return {
    handleAddText,
    handleAddFeatureCard,
    handleAddIconCard,
    handleAddImageCard,
    handleAddLabelCard,
    handleAddListCard,
    handleAddQuote,
    handleAddComparisonCard,
    handleAddTitleCard,
    handleAddPricingCard,
  };
};
