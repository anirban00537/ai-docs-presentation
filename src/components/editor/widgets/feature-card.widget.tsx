"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type {
  FeatureCardWidget,
  ResizeHandle,
} from "@/components/editor/widgets/types";
import { ResizeHandles } from "@/components/editor/resize-handles";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectActiveSlideId,
  updateWidget as updateWidgetAction,
} from "@/store/slices/slidesSlice";
import { useDebouncedCallback } from "use-debounce";

type FeatureCardWidgetNodeProps = {
  widget: FeatureCardWidget;
  isSelected: boolean;
  isEditing: boolean;
  baseZIndex: number;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  getResizePointerDown: (
    handle: ResizeHandle
  ) => (event: React.PointerEvent<HTMLDivElement>) => void;
};

const FeatureCardWidgetNodeBase: React.FC<FeatureCardWidgetNodeProps> = ({
  widget,
  isSelected,
  isEditing,
  baseZIndex,
  onPointerDown,
  getResizePointerDown,
}) => {
  const dispatch = useAppDispatch();
  const activeSlideId = useAppSelector(selectActiveSlideId);

  const [localNumber, setLocalNumber] = React.useState(widget.number || "01");
  const [localTitle, setLocalTitle] = React.useState(widget.title || "");
  const [localDescription, setLocalDescription] = React.useState(
    widget.description || ""
  );

  const descriptionTextareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  // Auto-resize textarea based on content
  React.useLayoutEffect(() => {
    const textarea = descriptionTextareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [localDescription]);

  const debouncedUpdateNumber = useDebouncedCallback((value: string) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { number: value },
      })
    );
  }, 250);

  const debouncedUpdateTitle = useDebouncedCallback((value: string) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { title: value },
      })
    );
  }, 250);

  const debouncedUpdateDescription = useDebouncedCallback((value: string) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { description: value },
      })
    );
  }, 250);

  React.useEffect(() => {
    setLocalNumber((prev) =>
      prev === widget.number ? prev : widget.number || "01"
    );
  }, [widget.number]);

  React.useEffect(() => {
    setLocalTitle((prev) =>
      prev === widget.title ? prev : widget.title || ""
    );
  }, [widget.title]);

  React.useEffect(() => {
    setLocalDescription((prev) =>
      prev === widget.description ? prev : widget.description || ""
    );
  }, [widget.description]);

  React.useEffect(() => {
    return () => {
      debouncedUpdateNumber.flush();
      debouncedUpdateTitle.flush();
      debouncedUpdateDescription.flush();
    };
  }, [debouncedUpdateNumber, debouncedUpdateTitle, debouncedUpdateDescription]);

  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement;
      // Don't start drag if clicking on input/textarea
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }
      if (event.detail > 1) {
        return;
      }
      onPointerDown(event);
    },
    [onPointerDown]
  );

  const handleInputPointerDown = React.useCallback(
    (event: React.PointerEvent) => {
      event.stopPropagation();
    },
    []
  );

  const backgroundColor = widget.backgroundColor ?? "#374151"; // gray-700
  const numberColor = widget.numberColor ?? "#9ca3af"; // gray-400
  const titleColor = widget.titleColor ?? "#d1d5db"; // gray-300
  const descriptionColor = widget.descriptionColor ?? "#6b7280"; // gray-500

  return (
    <div
      className={cn(
        "canvas-element group absolute flex select-none border border-transparent transition",
        isSelected && !isEditing
          ? "border-primary/70 ring-1 ring-primary/60"
          : "border-transparent",
        "cursor-move"
      )}
      style={{
        left: widget.x,
        top: widget.y,
        width: widget.width,
        height: widget.height,
        zIndex: baseZIndex,
      }}
      onPointerDown={handlePointerDown}
    >
      <div className="canvas-element__content relative flex h-full w-full items-stretch justify-stretch rounded">
        <div
          className="relative h-full w-full rounded-lg p-6"
          style={{
            backgroundColor,
          }}
        >
          <div className="flex h-full flex-col gap-3">
            {/* Number field */}
            <input
              type="text"
              className="w-full resize-none border-none bg-transparent p-0 outline-none focus:ring-0 cursor-text"
              style={{
                fontSize: "3.75rem",
                fontWeight: 700,
                color: numberColor,
                lineHeight: 1,
              }}
              value={localNumber}
              onChange={(e) => {
                setLocalNumber(e.target.value);
                debouncedUpdateNumber(e.target.value);
              }}
              onPointerDown={handleInputPointerDown}
              placeholder="01"
            />

            {/* Title field */}
            <input
              type="text"
              className="w-full resize-none border-none bg-transparent p-0 outline-none focus:ring-0 cursor-text"
              style={{
                fontSize: "1.5rem",
                fontWeight: 600,
                color: titleColor,
                lineHeight: 1.25,
              }}
              value={localTitle}
              onChange={(e) => {
                setLocalTitle(e.target.value);
                debouncedUpdateTitle(e.target.value);
              }}
              onPointerDown={handleInputPointerDown}
              placeholder="Feature Title"
            />

            {/* Description field */}
            <textarea
              ref={descriptionTextareaRef}
              className="w-full resize-none border-none bg-transparent p-0 outline-none focus:ring-0 cursor-text overflow-hidden"
              style={{
                fontSize: "0.875rem",
                color: descriptionColor,
                lineHeight: 1.5,
                wordWrap: "break-word",
                overflowWrap: "break-word",
                minHeight: "3rem",
                overflow: "hidden",
              }}
              value={localDescription}
              onChange={(e) => {
                setLocalDescription(e.target.value);
                debouncedUpdateDescription(e.target.value);
                // Auto-resize on change
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              onPointerDown={handleInputPointerDown}
              placeholder="Feature description goes here."
            />
          </div>
        </div>
        {isSelected && !isEditing && (
          <ResizeHandles getResizePointerDown={getResizePointerDown} />
        )}
      </div>
    </div>
  );
};

export const FeatureCardWidgetNode = React.memo(FeatureCardWidgetNodeBase);
