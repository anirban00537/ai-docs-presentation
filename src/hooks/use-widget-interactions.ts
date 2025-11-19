import { useCallback } from "react";
import type { SlideWidgetUpdate } from "@/components/editor/widgets/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectWidget as selectWidgetAction,
  selectSelectedWidgetId,
  selectEditingWidgetId,
  selectLiveOverrides,
  stopWidgetEditing as stopWidgetEditingAction,
  setLiveOverride,
  clearLiveOverride,
} from "@/store/slices/editorUiSlice";

export const useWidgetInteractions = () => {
  const dispatch = useAppDispatch();
  const selectedId = useAppSelector(selectSelectedWidgetId);
  const editingId = useAppSelector(selectEditingWidgetId);
  const liveOverrides = useAppSelector(selectLiveOverrides);

  const handleSelectWidget = useCallback(
    (widgetId: string | null) => {
      dispatch(selectWidgetAction(widgetId));
    },
    [dispatch]
  );

  const handleStopEditing = useCallback(() => {
    dispatch(stopWidgetEditingAction());
  }, [dispatch]);

  const handleSetLiveOverride = useCallback(
    (widgetId: string, updates: SlideWidgetUpdate) => {
      dispatch(setLiveOverride({ widgetId, updates }));
    },
    [dispatch]
  );

  const handleClearLiveOverride = useCallback(
    (widgetId: string) => {
      dispatch(clearLiveOverride(widgetId));
    },
    [dispatch]
  );

  return {
    selectedId,
    editingId,
    liveOverrides,
    onSelectWidget: handleSelectWidget,
    onStopEditing: handleStopEditing,
    onSetLiveOverride: handleSetLiveOverride,
    onClearLiveOverride: handleClearLiveOverride,
  };
};

