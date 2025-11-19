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

type EditingField = "number" | "title" | "description" | null;

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
  const [editingField, setEditingField] = React.useState<EditingField>(null);

  const numberInputRef = React.useRef<HTMLInputElement | null>(null);
  const titleInputRef = React.useRef<HTMLInputElement | null>(null);
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

  // Reset editing field when widget is deselected
  React.useEffect(() => {
    if (!isSelected) {
      setEditingField(null);
    }
  }, [isSelected]);

  // Focus input when entering edit mode
  React.useEffect(() => {
    if (editingField === "number" && numberInputRef.current) {
      numberInputRef.current.focus();
      numberInputRef.current.select();
    } else if (editingField === "title" && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    } else if (
      editingField === "description" &&
      descriptionTextareaRef.current
    ) {
      descriptionTextareaRef.current.focus();
      descriptionTextareaRef.current.select();
    }
  }, [editingField]);

  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement;
      // Don't start drag if clicking on input/textarea or field display divs
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.closest('[data-field="number"]') ||
        target.closest('[data-field="title"]') ||
        target.closest('[data-field="description"]')
      ) {
        return;
      }
      if (event.detail > 1) {
        return;
      }
      onPointerDown(event);
    },
    [onPointerDown]
  );

  const handleFieldPointerDown = React.useCallback(
    (field: EditingField, event: React.PointerEvent) => {
      event.stopPropagation();
      if (isSelected && event.detail === 1) {
        setEditingField(field);
      }
    },
    [isSelected]
  );

  const handleFieldClick = React.useCallback(
    (field: EditingField, event: React.MouseEvent) => {
      event.stopPropagation();
      if (isSelected) {
        setEditingField(field);
      }
    },
    [isSelected]
  );

  const handleFieldBlur = React.useCallback(
    (field: EditingField) => {
      if (field === "number") {
        debouncedUpdateNumber.flush();
      } else if (field === "title") {
        debouncedUpdateTitle.flush();
      } else if (field === "description") {
        debouncedUpdateDescription.flush();
      }
      // Small delay to allow click outside to deselect
      setTimeout(() => {
        setEditingField(null);
      }, 100);
    },
    [debouncedUpdateNumber, debouncedUpdateTitle, debouncedUpdateDescription]
  );

  const handleFieldKeyDown = React.useCallback(
    (field: EditingField, event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (field === "number") {
          debouncedUpdateNumber.flush();
        } else if (field === "title") {
          debouncedUpdateTitle.flush();
        } else if (field === "description") {
          debouncedUpdateDescription.flush();
        }
        setEditingField(null);
      } else if (event.key === "Enter" && field !== "description") {
        event.preventDefault();
        handleFieldBlur(field);
      }
    },
    [
      debouncedUpdateNumber,
      debouncedUpdateTitle,
      debouncedUpdateDescription,
      handleFieldBlur,
    ]
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
            {editingField === "number" ? (
              <input
                ref={numberInputRef}
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
                onBlur={() => handleFieldBlur("number")}
                onKeyDown={(e) => handleFieldKeyDown("number", e)}
                placeholder="01"
              />
            ) : (
              <div
                data-field="number"
                className="text-6xl font-bold leading-none cursor-text"
                style={{ color: numberColor }}
                onClick={(e) => handleFieldClick("number", e)}
                onPointerDown={(e) => handleFieldPointerDown("number", e)}
              >
                {widget.number || "01"}
              </div>
            )}

            {/* Title field */}
            {editingField === "title" ? (
              <input
                ref={titleInputRef}
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
                onBlur={() => handleFieldBlur("title")}
                onKeyDown={(e) => handleFieldKeyDown("title", e)}
                placeholder="Feature Title"
              />
            ) : (
              <div
                data-field="title"
                className="text-2xl font-semibold leading-tight cursor-text"
                style={{ color: titleColor }}
                onClick={(e) => handleFieldClick("title", e)}
                onPointerDown={(e) => handleFieldPointerDown("title", e)}
              >
                {widget.title || "Feature Title"}
              </div>
            )}

            {/* Description field */}
            {editingField === "description" ? (
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
                onBlur={() => handleFieldBlur("description")}
                onKeyDown={(e) => handleFieldKeyDown("description", e)}
                placeholder="Feature description goes here."
              />
            ) : (
              <div
                data-field="description"
                className="text-sm leading-relaxed cursor-text whitespace-pre-wrap"
                style={{ color: descriptionColor }}
                onClick={(e) => handleFieldClick("description", e)}
                onPointerDown={(e) => handleFieldPointerDown("description", e)}
              >
                {widget.description || "Feature description goes here."}
              </div>
            )}
          </div>
        </div>
        {isSelected && !isEditing && editingField === null && (
          <ResizeHandles getResizePointerDown={getResizePointerDown} />
        )}
      </div>
    </div>
  );
};

export const FeatureCardWidgetNode = React.memo(FeatureCardWidgetNodeBase);
