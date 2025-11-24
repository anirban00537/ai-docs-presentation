import { useCallback } from "react";
import { nanoid } from "@reduxjs/toolkit";
import type { ListCardPreset } from "@/components/editor/types";
import type { ListWidget } from "./types";
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

export const useListCardCreation = () => {
  const dispatch = useAppDispatch();
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const globalTheme = useAppSelector(selectGlobalTheme);

  const ensureSlideId = useCallback(() => {
    if (!activeSlideId) {
      return null;
    }
    return activeSlideId;
  }, [activeSlideId]);

  const handleAddListCard = useCallback(
    (preset: ListCardPreset) => {
      const slideId = ensureSlideId();
      if (!slideId) return;
      const id = `list-card-${nanoid(8)}`;
      const width = 300;
      const height = 300;
      const originX = Math.max(
        40,
        Math.round((SLIDE_DIMENSIONS.width - width) / 2)
      );
      const originY = Math.round((SLIDE_DIMENSIONS.height - height) / 2);

      const newWidget: ListWidget = {
        id,
        type: "list",
        items: preset.items && preset.items.length > 0 ? preset.items : [""],
        listType: preset.listType ?? "bullet",
        title: preset.title,
        x: originX,
        y: originY,
        width,
        height,
        // Seed with current theme colors so card matches active theme
        backgroundColor: globalTheme?.surface ?? "#ffffff",
        itemColor: globalTheme?.text ?? "#0f172a",
        bulletColor: globalTheme?.accent ?? "#0f172a",
        titleColor: globalTheme?.text ?? "#0f172a",
        textAlign: "left",
        backgroundType: "glass",
      };

      dispatch(addWidget({ widget: newWidget, slideId }));
      dispatch(selectWidgetAction(newWidget.id));
      dispatch(stopWidgetEditingAction());
    },
    [dispatch, ensureSlideId, globalTheme]
  );

  return {
    handleAddListCard,
  };
};

