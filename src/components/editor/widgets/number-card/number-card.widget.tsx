"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { ResizeHandle } from "@/components/editor/widgets/types";
import type { NumberCardWidget } from "./types";
import { TOOLBAR_SELECTOR } from "./constants";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectActiveSlideId,
  updateWidget as updateWidgetAction,
} from "@/store/slices/slidesSlice";
import type { GlobalTheme } from "@/store/slices/slidesSlice";
import { useDebouncedCallback } from "use-debounce";
import type { Viewport } from "@/hooks/use-canvas-viewport";
import { ProseMirrorEditor } from "@/components/editor/prosemirror-editor";
import { WidgetToolbar } from "@/components/editor/widgets/shared/toolbar-controls/widget-toolbar";
import type { ToolbarControlConfig } from "@/components/editor/widgets/shared/toolbar-controls/types";
import {
  WidgetContainer,
  WidgetBackground,
  useWidgetPointerDown,
} from "@/components/editor/widgets/shared";

type NumberCardWidgetNodeProps = {
  widget: NumberCardWidget;
  isSelected: boolean;
  isEditing: boolean;
  baseZIndex: number;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  getResizePointerDown: (
    handle: ResizeHandle
  ) => (event: React.PointerEvent<HTMLDivElement>) => void;
  viewport: Viewport;
  containerRef: React.RefObject<HTMLElement | null>;
  globalTheme?: GlobalTheme; // Use globalTheme from props, not from Redux state
};

type ActiveField = "number" | "title" | "description" | null;

const NumberCardWidgetNodeBase: React.FC<NumberCardWidgetNodeProps> = ({
  widget,
  isSelected,
  isEditing,
  baseZIndex,
  onPointerDown,
  getResizePointerDown,
  viewport,
  containerRef,
  globalTheme,
}) => {
  const dispatch = useAppDispatch();
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const widgetRef = React.useRef<HTMLDivElement | null>(null);

  const [localNumber, setLocalNumber] = React.useState(widget.number || "01");
  const [localTitle, setLocalTitle] = React.useState(widget.title || "");
  const [localDescription, setLocalDescription] = React.useState(
    widget.description || ""
  );
  const [activeField, setActiveField] = React.useState<ActiveField>(null);

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

  // Reset active field when widget is deselected
  React.useEffect(() => {
    if (!isSelected) {
      setActiveField(null);
    }
  }, [isSelected]);

  const handlePointerDown = useWidgetPointerDown({
    onPointerDown,
    toolbarSelector: TOOLBAR_SELECTOR,
  });

  const handleFieldFocus = React.useCallback((field: ActiveField) => {
    setActiveField(field);
  }, []);

  const handleFieldBlur = React.useCallback(
    (field: ActiveField) => {
      if (field === "number") {
        debouncedUpdateNumber.flush();
      } else if (field === "title") {
        debouncedUpdateTitle.flush();
      } else if (field === "description") {
        debouncedUpdateDescription.flush();
      }
    },
    [debouncedUpdateNumber, debouncedUpdateTitle, debouncedUpdateDescription]
  );

  // Widget-local colors and fonts - use global theme when undefined
  const backgroundColor = widget.backgroundColor ?? undefined;
  const numberColor = widget.numberColor ?? globalTheme?.accent ?? "#0f172a";
  const titleColor = widget.titleColor ?? globalTheme?.text ?? "#0f172a";
  const descriptionColor =
    widget.descriptionColor ?? globalTheme?.text ?? "#475569";
  const numberFontFamily =
    widget.numberFontFamily ?? globalTheme?.font ?? "var(--font-poppins)";
  const titleFontFamily =
    widget.titleFontFamily ?? globalTheme?.font ?? "var(--font-poppins)";
  const descriptionFontFamily =
    widget.descriptionFontFamily ?? globalTheme?.font ?? "var(--font-poppins)";
  const numberFontSize = widget.numberFontSize ?? 56;
  const titleFontSize = widget.titleFontSize ?? 24;
  const descriptionFontSize = widget.descriptionFontSize ?? 18;
  const textAlign = widget.textAlign ?? "left";
  const backgroundType = widget.backgroundType ?? "solid";

  const toolbar = isSelected ? (
    <NumberCardEditingToolbar
      widget={widget}
      isEditing={isEditing}
      activeField={activeField}
      widgetRef={widgetRef}
      viewport={viewport}
      containerRef={containerRef}
      globalTheme={globalTheme}
    />
  ) : null;

  return (
    <WidgetContainer
      widgetRef={widgetRef}
      isSelected={isSelected}
      isEditing={isEditing}
      widget={widget}
      baseZIndex={baseZIndex}
      onPointerDown={handlePointerDown}
      getResizePointerDown={getResizePointerDown}
      toolbar={toolbar}
    >
      <WidgetBackground
        backgroundType={backgroundType}
        backgroundColor={backgroundColor}
        globalTheme={globalTheme}
      >
        <div className="flex h-full flex-col gap-4" style={{ textAlign }}>
          {/* Number field */}
          <ProseMirrorEditor
            value={localNumber}
            onChange={(value) => {
              if (!isSelected) return;
              setLocalNumber(value);
              debouncedUpdateNumber(value);
            }}
            onFocus={() => {
              if (!isSelected) return;
              handleFieldFocus("number");
            }}
            onBlur={() => handleFieldBlur("number")}
            placeholder="01"
            readOnly={!isSelected}
            className={cn(
              "w-full",
              isSelected ? "cursor-text" : "cursor-default"
            )}
            style={{
              fontSize: `${numberFontSize}px`,
              fontWeight: 800,
              color: numberColor,
              fontFamily: numberFontFamily,
              lineHeight: 1,
              textAlign,
            }}
          />

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
            placeholder="Feature Title"
            readOnly={!isSelected}
            className={cn(
              "w-full",
              isSelected ? "cursor-text" : "cursor-default"
            )}
            style={{
              fontSize: `${titleFontSize}px`,
              fontWeight: 600,
              color: titleColor,
              fontFamily: titleFontFamily,
              lineHeight: 1.25,
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
            placeholder="Feature description goes here."
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
      </WidgetBackground>
    </WidgetContainer>
  );
};

export const NumberCardWidgetNode = React.memo(NumberCardWidgetNodeBase);

type NumberCardEditingToolbarProps = {
  widget: NumberCardWidget;
  isEditing: boolean;
  activeField: ActiveField;
  widgetRef: React.RefObject<HTMLElement | null>;
  viewport: Viewport;
  containerRef: React.RefObject<HTMLElement | null>;
  globalTheme?: GlobalTheme; // Use globalTheme from props, not from Redux state
};

const NumberCardEditingToolbar: React.FC<NumberCardEditingToolbarProps> = ({
  widget,
  isEditing,
  activeField,
  widgetRef,
  viewport,
  containerRef,
  globalTheme,
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
    type: NumberCardWidget["backgroundType"]
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

  const handleSetTextColor = (color: string) => {
    if (!activeField) return;

    const colorKey =
      activeField === "number"
        ? "numberColor"
        : activeField === "title"
        ? "titleColor"
        : "descriptionColor";

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
      activeField === "number"
        ? "numberFontFamily"
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
      activeField === "number"
        ? "numberFontSize"
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
  const currentBackgroundColor =
    widget.backgroundColor ?? globalTheme?.surface ?? "#ffffff";
  const currentBackgroundType = widget.backgroundType ?? "solid";

  const currentTextColor =
    activeField === "number"
      ? widget.numberColor ?? globalTheme?.accent ?? "#0f172a"
      : activeField === "title"
      ? widget.titleColor ?? globalTheme?.text ?? "#0f172a"
      : activeField === "description"
      ? widget.descriptionColor ?? globalTheme?.text ?? "#475569"
      : globalTheme?.text ?? "#0f172a";

  const currentFontFamily =
    activeField === "number"
      ? widget.numberFontFamily ?? globalTheme?.font ?? "var(--font-poppins)"
      : activeField === "title"
      ? widget.titleFontFamily ?? globalTheme?.font ?? "var(--font-poppins)"
      : activeField === "description"
      ? widget.descriptionFontFamily ??
        globalTheme?.font ??
        "var(--font-poppins)"
      : globalTheme?.font ?? "var(--font-poppins)";

  const currentFontSize =
    activeField === "number"
      ? widget.numberFontSize ?? 56
      : activeField === "title"
      ? widget.titleFontSize ?? 24
      : widget.descriptionFontSize ?? 18;

  const controls: ToolbarControlConfig[] = [
    // Background color picker
    {
      type: "color-picker",
      config: {
        color: currentBackgroundColor,
        onChange: handleSetBackgroundColor,
        label: "Background Color",
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
        label: activeField ? `${activeField} Color` : "Text Color",
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
      toolbarSelector="data-number-card-toolbar"
    />
  );
};
