import { useCallback } from "react";
import type { SlideElementUpdate } from "@/components/editor/widgets/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectElement as selectElementAction,
  selectSelectedElementId,
  selectEditingElementId,
  selectLiveOverrides,
  stopEditing as stopEditingAction,
  setLiveOverride,
  clearLiveOverride,
} from "@/store/slices/editorUiSlice";

export const useElementInteractions = () => {
  const dispatch = useAppDispatch();
  const selectedId = useAppSelector(selectSelectedElementId);
  const editingId = useAppSelector(selectEditingElementId);
  const liveOverrides = useAppSelector(selectLiveOverrides);

  const handleSelectElement = useCallback(
    (elementId: string | null) => {
      dispatch(selectElementAction(elementId));
    },
    [dispatch]
  );

  const handleStopEditing = useCallback(() => {
    dispatch(stopEditingAction());
  }, [dispatch]);

  const handleSetLiveOverride = useCallback(
    (elementId: string, updates: SlideElementUpdate) => {
      dispatch(setLiveOverride({ elementId, updates }));
    },
    [dispatch]
  );

  const handleClearLiveOverride = useCallback(
    (elementId: string) => {
      dispatch(clearLiveOverride(elementId));
    },
    [dispatch]
  );

  return {
    selectedId,
    editingId,
    liveOverrides,
    onSelectElement: handleSelectElement,
    onStopEditing: handleStopEditing,
    onSetLiveOverride: handleSetLiveOverride,
    onClearLiveOverride: handleClearLiveOverride,
  };
};

