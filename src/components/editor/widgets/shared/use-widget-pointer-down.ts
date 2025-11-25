import { useCallback, useMemo } from "react";
import type { PointerEvent } from "react";

interface UseWidgetPointerDownOptions {
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  toolbarSelector: string;
  additionalSelectors?: string[];
}

export const useWidgetPointerDown = ({
  onPointerDown,
  toolbarSelector,
  additionalSelectors,
}: UseWidgetPointerDownOptions) => {
  const memoizedSelectors = useMemo(
    () => additionalSelectors ?? [],
    [additionalSelectors]
  );

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement;

      // Don't start drag if clicking toolbar controls
      if (target.closest(toolbarSelector)) {
        return;
      }

      // Don't start drag if clicking additional selectors (e.g., action buttons)
      for (const selector of memoizedSelectors) {
        if (target.closest(selector)) {
          return;
        }
      }

      // Don't start drag if clicking text inputs/editors
      const isTextTarget =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.closest(".prosemirror-editor") ||
        target.closest(".ProseMirror");

      if (isTextTarget) {
        return;
      }

      // Don't start drag on double click
      if (event.detail > 1) {
        return;
      }

      onPointerDown(event);
    },
    [onPointerDown, toolbarSelector, memoizedSelectors]
  );

  return handlePointerDown;
};
