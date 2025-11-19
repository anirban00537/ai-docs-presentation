import { useCallback, useEffect, useRef } from "react";
import type {
  SlideElement,
  ResizeHandle,
  SlideElementUpdate,
} from "@/components/editor/widgets/types";
import type { PointerSession } from "@/store/slices/editorUiSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectActiveSlideId,
  updateElement as updateElementAction,
} from "@/store/slices/slidesSlice";
import {
  selectActivePointerId,
  selectPointerSession,
  startPointerSession as startPointerSessionAction,
  updatePointerSession as updatePointerSessionAction,
  endPointerSession as endPointerSessionAction,
} from "@/store/slices/editorUiSlice";
import { useDragAndResize } from "./use-drag-and-resize";
import type { ScreenToSlideTransform } from "./use-canvas-viewport";

type UsePointerSessionOptions = {
  screenToSlide: ScreenToSlideTransform;
  onSetLiveOverride: (elementId: string, updates: SlideElementUpdate) => void;
  onClearLiveOverride: (elementId: string) => void;
};

export const usePointerSession = ({
  screenToSlide,
  onSetLiveOverride,
  onClearLiveOverride,
}: UsePointerSessionOptions) => {
  const dispatch = useAppDispatch();
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const activePointerId = useAppSelector(selectActivePointerId);
  const pointerSession = useAppSelector(selectPointerSession);
  const pointerSessionRef = useRef<PointerSession | null>(null);

  const { computeDrag, computeResize } = useDragAndResize(screenToSlide);

  useEffect(() => {
    pointerSessionRef.current = pointerSession;
  }, [pointerSession]);

  const logInteraction = useCallback(
    (
      action:
        | "drag:start"
        | "drag:move"
        | "drag:stop"
        | "resize:start"
        | "resize:move"
        | "resize:stop",
      detail: {
        id: string;
        x: number;
        y: number;
        width?: number;
        height?: number;
      }
    ) => {
      console.log(`[Slide] ${action}`, detail);
    },
    []
  );

  const finishPointerSession = useCallback(
    (cancelled = false) => {
      const session = pointerSessionRef.current;
      if (!session) return;

      const { elementId, type, lastRect, startRect } = session;
      const finalRect = lastRect ?? startRect;

      logInteraction(`${type}:stop`, { id: elementId, ...finalRect });

      if (!cancelled && activeSlideId) {
        dispatch(
          updateElementAction({
            slideId: activeSlideId ?? undefined,
            elementId,
            updates: finalRect,
          })
        );
      }

      onClearLiveOverride(elementId);
      pointerSessionRef.current = null;
      dispatch(endPointerSessionAction());
    },
    [activeSlideId, dispatch, logInteraction, onClearLiveOverride]
  );

  // Handle pointer move events
  useEffect(() => {
    if (activePointerId == null) {
      return;
    }

    const handleMove = (event: PointerEvent) => {
      const session = pointerSessionRef.current;
      if (!session || event.pointerId !== activePointerId) {
        return;
      }
      event.preventDefault();

      let override: SlideElementUpdate;
      if (session.type === "drag") {
        override = computeDrag(session, event.clientX, event.clientY);
      } else {
        override = computeResize(session, event.clientX, event.clientY);
      }

      const action = session.type === "drag" ? "drag:move" : "resize:move";
      const lastRect = {
        x: override.x ?? session.startRect.x,
        y: override.y ?? session.startRect.y,
        width: override.width ?? session.startRect.width,
        height: override.height ?? session.startRect.height,
      };

      logInteraction(action, {
        id: session.elementId,
        ...lastRect,
      });

      onSetLiveOverride(session.elementId, override);
      dispatch(updatePointerSessionAction({ lastRect }));
      pointerSessionRef.current = { ...session, lastRect };
    };

    const finish = (event: PointerEvent, cancelled: boolean) => {
      const session = pointerSessionRef.current;
      if (!session || event.pointerId !== activePointerId) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (target?.hasPointerCapture?.(event.pointerId)) {
        target.releasePointerCapture(event.pointerId);
      }

      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleCancel);
      finishPointerSession(cancelled);
    };

    const handleUp = (event: PointerEvent) => finish(event, false);
    const handleCancel = (event: PointerEvent) => finish(event, true);

    window.addEventListener("pointermove", handleMove, { passive: false });
    window.addEventListener("pointerup", handleUp, { passive: false });
    window.addEventListener("pointercancel", handleCancel, { passive: false });

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleCancel);
    };
  }, [
    activePointerId,
    computeDrag,
    computeResize,
    finishPointerSession,
    dispatch,
    logInteraction,
    onSetLiveOverride,
  ]);

  const beginDrag = useCallback(
    (
      element: SlideElement,
      effective: SlideElement,
      event: React.PointerEvent<HTMLDivElement>
    ) => {
      if (event.button !== 0) return;

      const pointer = {
        x: event.clientX,
        y: event.clientY,
      };

      const startRect = {
        x: effective.x,
        y: effective.y,
        width: effective.width,
        height: effective.height,
      };

      const session: PointerSession = {
        type: "drag",
        elementId: element.id,
        pointerId: event.pointerId,
        startPointer: pointer,
        startRect,
        lastRect: startRect,
      };

      pointerSessionRef.current = session;
      dispatch(startPointerSessionAction(session));

      logInteraction("drag:start", {
        id: element.id,
        x: startRect.x,
        y: startRect.y,
        width: startRect.width,
        height: startRect.height,
      });

      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [dispatch, logInteraction]
  );

  const beginResize = useCallback(
    (
      element: SlideElement,
      effective: SlideElement,
      handle: ResizeHandle,
      event: React.PointerEvent<HTMLDivElement>
    ) => {
      if (event.button !== 0) return;

      event.stopPropagation();
      event.preventDefault();

      const pointer = {
        x: event.clientX,
        y: event.clientY,
      };

      const startRect = {
        x: effective.x,
        y: effective.y,
        width: effective.width,
        height: effective.height,
      };

      const session: PointerSession = {
        type: "resize",
        elementId: element.id,
        pointerId: event.pointerId,
        handle,
        startPointer: pointer,
        startRect,
        lastRect: startRect,
      };

      pointerSessionRef.current = session;
      dispatch(startPointerSessionAction(session));

      logInteraction("resize:start", {
        id: element.id,
        x: startRect.x,
        y: startRect.y,
        width: startRect.width,
        height: startRect.height,
      });

      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [dispatch, logInteraction]
  );

  return {
    beginDrag,
    beginResize,
  };
};
