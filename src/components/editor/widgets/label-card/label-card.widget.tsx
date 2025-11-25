"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronDown, Sparkles } from "lucide-react";
import type { ResizeHandle } from "@/components/editor/widgets/types";
import type { LabelCardWidget } from "./types";
import {
  TOOLBAR_SELECTOR,
} from "./constants";
import { ResizeHandles } from "@/components/editor/resize-handles";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectActiveSlideId,
  updateWidget as updateWidgetAction,
} from "@/store/slices/slidesSlice";
import { useDebouncedCallback } from "use-debounce";
import type { Viewport } from "@/hooks/use-canvas-viewport";
import { ProseMirrorEditor } from "@/components/editor/prosemirror-editor";
import { WidgetToolbar } from "@/components/editor/widgets/shared/toolbar-controls/widget-toolbar";
import type { ToolbarControlConfig } from "@/components/editor/widgets/shared/toolbar-controls/types";

type LabelCardWidgetNodeProps = {
  widget: LabelCardWidget;
  isSelected: boolean;
  isEditing: boolean;
  baseZIndex: number;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  getResizePointerDown: (
    handle: ResizeHandle
  ) => (event: React.PointerEvent<HTMLDivElement>) => void;
  viewport: Viewport;
  containerRef: React.RefObject<HTMLElement | null>;
};

type ActiveField = "label" | "title" | "description" | null;

const LabelCardWidgetNodeBase: React.FC<LabelCardWidgetNodeProps> = ({
  widget,
  isSelected,
  isEditing,
  baseZIndex,
  onPointerDown,
  getResizePointerDown,
  viewport,
  containerRef,
}) => {
  const dispatch = useAppDispatch();
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const widgetRef = React.useRef<HTMLDivElement>(null);

  const [localLabel, setLocalLabel] = React.useState(widget.label || "Label");
  const [localTitle, setLocalTitle] = React.useState(widget.title || "");
  const [localDescription, setLocalDescription] = React.useState(
    widget.description || ""
  );
  const [activeField, setActiveField] = React.useState<ActiveField>(null);


  const debouncedUpdateLabel = useDebouncedCallback((value: string) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { label: value },
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
    setLocalLabel((prev) =>
      prev === widget.label ? prev : widget.label || "Label"
    );
  }, [widget.label]);

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
      debouncedUpdateLabel.flush();
      debouncedUpdateTitle.flush();
      debouncedUpdateDescription.flush();
    };
  }, [debouncedUpdateLabel, debouncedUpdateTitle, debouncedUpdateDescription]);

  // Reset active field when widget is deselected
  React.useEffect(() => {
    if (!isSelected) {
      setActiveField(null);
    }
  }, [isSelected]);

  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement;
      // Don't start drag if clicking on toolbar controls
      if (target.closest(TOOLBAR_SELECTOR)) {
        return;
      }

      const isTextTarget =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.closest(".prosemirror-editor") ||
        target.closest(".ProseMirror");

      if (isTextTarget) {
        return;
      }

      if (event.detail > 1) {
        return;
      }
      onPointerDown(event);
    },
    [onPointerDown]
  );

  const handleFieldFocus = React.useCallback((field: ActiveField) => {
    setActiveField(field);
  }, []);

  const handleFieldBlur = React.useCallback(
    (field: ActiveField) => {
      if (field === "label") {
        debouncedUpdateLabel.flush();
      } else if (field === "title") {
        debouncedUpdateTitle.flush();
      } else if (field === "description") {
        debouncedUpdateDescription.flush();
      }
    },
    [debouncedUpdateLabel, debouncedUpdateTitle, debouncedUpdateDescription]
  );


  // Widget-local colors and fonts with sensible defaults
  const backgroundColor = widget.backgroundColor ?? "#ffffff";
  const labelColor = widget.labelColor ?? "#0f172a";
  const labelTextColor = widget.labelTextColor ?? "#ffffff";
  const titleColor = widget.titleColor ?? "#0f172a";
  const descriptionColor = widget.descriptionColor ?? "#475569";
  const labelFontFamily = widget.labelFontFamily ?? "var(--font-poppins)";
  const titleFontFamily = widget.titleFontFamily ?? "var(--font-poppins)";
  const descriptionFontFamily =
    widget.descriptionFontFamily ?? "var(--font-poppins)";
  const labelFontSize = widget.labelFontSize ?? 13;
  const titleFontSize = widget.titleFontSize ?? 40;
  const descriptionFontSize = widget.descriptionFontSize ?? 20;
  const textAlign = widget.textAlign ?? "left";
  const backgroundType = widget.backgroundType ?? "solid";
  const isGlassBackground = backgroundType === "glass";
  const isTransparentBackground = backgroundType === "transparent";

  return (
    <div
      ref={widgetRef}
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
        {isSelected && (
          <LabelCardEditingToolbar
            widget={widget}
            isEditing={isEditing}
            activeField={activeField}
            widgetRef={widgetRef}
            viewport={viewport}
            containerRef={containerRef}
          />
        )}
        <div
          className={cn(
            "relative h-full w-full rounded-[16px] p-8 transition-all duration-300 ease-out shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)]",
            isGlassBackground && "backdrop-blur-2xl",
            isTransparentBackground && "bg-transparent shadow-none"
          )}
          style={{
            backgroundColor: isGlassBackground
              ? `${backgroundColor}03`
              : isTransparentBackground
              ? "transparent"
              : backgroundColor,
            backgroundImage: isGlassBackground
              ? "linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.02) 100%)"
              : undefined,
            boxShadow: isGlassBackground
              ? "inset 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 0 rgba(255, 255, 255, 0.25)"
              : "none",
          }}
        >
          <div className="flex h-full flex-col gap-4" style={{ textAlign }}>
            {/* Label field */}
            <div
              className="flex"
              style={{
                justifyContent:
                  textAlign === "center"
                    ? "center"
                    : textAlign === "right"
                    ? "flex-end"
                    : "flex-start",
              }}
            >
              <div
                className="relative inline-flex items-center justify-center px-3 py-1 rounded-full shadow-sm"
                style={{
                  backgroundColor: labelColor,
                }}
              >
                <ProseMirrorEditor
                  value={localLabel}
                  onChange={(value) => {
                    if (!isSelected) return;
                    setLocalLabel(value);
                    debouncedUpdateLabel(value);
                  }}
                  onFocus={() => {
                    if (!isSelected) return;
                    handleFieldFocus("label");
                  }}
                  onBlur={() => handleFieldBlur("label")}
                  placeholder="Label"
                  readOnly={!isSelected}
                  className={cn(
                    "w-auto min-w-[60px] text-center",
                    isSelected ? "cursor-text" : "cursor-default"
                  )}
                  style={{
                    color: labelTextColor,
                    fontFamily: labelFontFamily,
                    fontSize: `${labelFontSize}px`,
                    lineHeight: 1.2,
                  }}
                />
              </div>
            </div>

            {/* Title field */}
            <ProseMirrorEditor
              value={localTitle}
              onChange={(value) => {
                if (!isSelected) return;
                setLocalTitle(value);
                debouncedUpdateTitle(value);
              }}
              onFocus={() => {
                if (!isSelected) return;
                handleFieldFocus("title");
              }}
              onBlur={() => handleFieldBlur("title")}
              placeholder="Card Title"
              readOnly={!isSelected}
              className={cn(
                "w-full",
                isSelected ? "cursor-text" : "cursor-default"
              )}
              style={{
                fontSize: `${titleFontSize}px`,
                fontWeight: 700,
                color: titleColor,
                fontFamily: titleFontFamily,
                lineHeight: 1.2,
                textAlign,
              }}
            />

            {/* Description field */}
            <ProseMirrorEditor
              value={localDescription}
              onChange={(value) => {
                if (!isSelected) return;
                setLocalDescription(value);
                debouncedUpdateDescription(value);
              }}
              onFocus={() => {
                if (!isSelected) return;
                handleFieldFocus("description");
              }}
              onBlur={() => handleFieldBlur("description")}
              placeholder="Description text goes here."
              readOnly={!isSelected}
              className={cn(
                "w-full",
                isSelected ? "cursor-text" : "cursor-default"
              )}
              style={{
                fontSize: `${descriptionFontSize}px`,
                color: descriptionColor,
                fontFamily: descriptionFontFamily,
                lineHeight: 1.5,
                wordWrap: "break-word",
                overflowWrap: "break-word",
                minHeight: "3rem",
                textAlign,
              }}
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

export const LabelCardWidgetNode = React.memo(LabelCardWidgetNodeBase);

type LabelCardEditingToolbarProps = {
  widget: LabelCardWidget;
  isEditing: boolean;
  activeField: ActiveField;
  widgetRef: React.RefObject<HTMLElement | null>;
  viewport: Viewport;
  containerRef: React.RefObject<HTMLElement | null>;
};

const LabelCardEditingToolbar: React.FC<LabelCardEditingToolbarProps> = ({
  widget,
  isEditing,
  activeField,
  widgetRef,
  viewport,
  containerRef,
}) => {
  const dispatch = useAppDispatch();
  const activeSlideId = useAppSelector(selectActiveSlideId);

  const handleSetBackgroundColor = (color: string) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { backgroundColor: color },
      })
    );
  };

  const handleSetBackgroundType = (
    type: LabelCardWidget["backgroundType"]
  ) => {
    if (type === (widget.backgroundType ?? "solid")) return;
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { backgroundType: type },
      })
    );
  };

  const handleSetLabelColor = (color: string) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { labelColor: color },
      })
    );
  };

  const handleSetTextColor = (color: string) => {
    if (!activeField) return;

    if (activeField === "label") {
      dispatch(
        updateWidgetAction({
          slideId: activeSlideId,
          widgetId: widget.id,
          updates: { labelTextColor: color },
        })
      );
      return;
    }

    const colorKey =
      activeField === "title" ? "titleColor" : "descriptionColor";

    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { [colorKey]: color },
      })
    );
  };

  const handleSetFontFamily = (fontFamily: string) => {
    if (!activeField) return;

    const fontKey =
      activeField === "label"
        ? "labelFontFamily"
        : activeField === "title"
        ? "titleFontFamily"
        : "descriptionFontFamily";

    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { [fontKey]: fontFamily },
      })
    );
  };

  const handleSetFontSize = (size: number) => {
    if (!activeField) return;

    const sizeKey =
      activeField === "label"
        ? "labelFontSize"
        : activeField === "title"
        ? "titleFontSize"
        : "descriptionFontSize";

    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { [sizeKey]: size },
      })
    );
  };

  const handleAlign = (align: "left" | "center" | "right") => {
    if (align !== (widget.textAlign ?? "left")) {
      dispatch(
        updateWidgetAction({
          slideId: activeSlideId,
          widgetId: widget.id,
          updates: { textAlign: align },
        })
      );
    }
  };

  const currentAlign = widget.textAlign ?? "left";
  const currentBackgroundColor = widget.backgroundColor ?? "#ffffff";
  const currentBackgroundType = widget.backgroundType ?? "solid";
  const currentLabelColor = widget.labelColor ?? "#0f172a";

  const currentTextColor =
    activeField === "label"
      ? widget.labelTextColor ?? "#ffffff"
      : activeField === "title"
      ? widget.titleColor ?? "#0f172a"
      : activeField === "description"
      ? widget.descriptionColor ?? "#475569"
      : "#0f172a";

  const currentFontFamily =
    activeField === "label"
      ? widget.labelFontFamily ?? "var(--font-poppins)"
      : activeField === "title"
      ? widget.titleFontFamily ?? "var(--font-poppins)"
      : activeField === "description"
      ? widget.descriptionFontFamily ?? "var(--font-poppins)"
      : "var(--font-poppins)";

  const currentFontSize =
    activeField === "label"
      ? widget.labelFontSize ?? 13
      : activeField === "title"
      ? widget.titleFontSize ?? 40
      : widget.descriptionFontSize ?? 20;

  const controls: ToolbarControlConfig[] = [
    // Label color picker (only when label is active)
    {
      type: "color-picker",
      config: {
        color: currentLabelColor,
        onChange: handleSetLabelColor,
        label: "Label Badge Color",
      },
      showWhen: (field) => field === "label",
    },
    { type: "separator", showWhen: (field) => field === "label" },
    // Background color picker
    {
      type: "color-picker",
      config: {
        color: currentBackgroundColor,
        onChange: handleSetBackgroundColor,
        label: "Card Background",
        showReset: true,
        resetValue: "#ffffff",
      },
    },
    // Background type selector
    {
      type: "background-type",
      config: {
        value: currentBackgroundType,
        onChange: handleSetBackgroundType,
      },
    },
    // Text color picker (conditional)
    {
      type: "color-picker",
      config: {
        color: currentTextColor,
        onChange: handleSetTextColor,
        label:
          activeField === "label"
            ? "Label Text Color"
            : activeField
            ? `${activeField} Color`
            : "Text Color",
      },
      showWhen: (field) => !!field,
    },
    // Font family selector (conditional)
    {
      type: "font-family",
      config: {
        value: currentFontFamily,
        onChange: handleSetFontFamily,
      },
      showWhen: (field) => !!field,
    },
    // Font size selector (conditional)
    {
      type: "font-size",
      config: {
        value: currentFontSize,
        onChange: handleSetFontSize,
      },
      showWhen: (field) => !!field,
    },
    { type: "separator" },
    // Alignment controls
    {
      type: "alignment",
      config: {
        value: currentAlign,
        onChange: handleAlign,
      },
    },
  ];

  return (
    <WidgetToolbar
      widgetRef={widgetRef}
      viewport={viewport}
      containerRef={containerRef}
      isEditing={isEditing}
      activeField={activeField}
      controls={controls}
      toolbarSelector="data-label-card-toolbar"
    />
  );
};
