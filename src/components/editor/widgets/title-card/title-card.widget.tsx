"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { ResizeHandle } from "@/components/editor/widgets/types";
import type { TitleCardWidget } from "./types";
import { TOOLBAR_SELECTOR } from "./constants";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectActiveSlideId,
  updateWidget as updateWidgetAction,
} from "@/store/slices/slidesSlice";
import { useDebouncedCallback } from "use-debounce";
import type { Viewport } from "@/hooks/use-canvas-viewport";
import { ProseMirrorEditor } from "@/components/editor/prosemirror-editor";
import {
  WidgetContainer,
  WidgetBackground,
  useWidgetPointerDown,
} from "@/components/editor/widgets/shared";
import { WidgetToolbar } from "@/components/editor/widgets/shared/toolbar-controls/widget-toolbar";
import type { ToolbarControlConfig } from "@/components/editor/widgets/shared/toolbar-controls/types";

type TitleCardWidgetNodeProps = {
  widget: TitleCardWidget;
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

type ActiveField = "eyebrow" | "title" | "subtitle" | null;

const TitleCardWidgetNodeBase: React.FC<TitleCardWidgetNodeProps> = ({
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
  const widgetRef = React.useRef<HTMLDivElement | null>(null);

  const [localEyebrow, setLocalEyebrow] = React.useState(
    widget.eyebrow ?? "Presentation"
  );
  const [localTitle, setLocalTitle] = React.useState(widget.title ?? "Title");
  const [localSubtitle, setLocalSubtitle] = React.useState(
    widget.subtitle ?? ""
  );
  const [activeField, setActiveField] = React.useState<ActiveField>(null);

  const debouncedUpdateEyebrow = useDebouncedCallback((value: string) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { eyebrow: value },
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

  const debouncedUpdateSubtitle = useDebouncedCallback((value: string) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { subtitle: value },
      })
    );
  }, 250);

  React.useEffect(() => {
    setLocalEyebrow((prev) =>
      prev === widget.eyebrow ? prev : widget.eyebrow ?? "Presentation"
    );
  }, [widget.eyebrow]);

  React.useEffect(() => {
    setLocalTitle((prev) =>
      prev === widget.title ? prev : widget.title ?? ""
    );
  }, [widget.title]);

  React.useEffect(() => {
    setLocalSubtitle((prev) =>
      prev === widget.subtitle ? prev : widget.subtitle ?? ""
    );
  }, [widget.subtitle]);

  React.useEffect(() => {
    return () => {
      debouncedUpdateEyebrow.flush();
      debouncedUpdateTitle.flush();
      debouncedUpdateSubtitle.flush();
    };
  }, [debouncedUpdateEyebrow, debouncedUpdateTitle, debouncedUpdateSubtitle]);

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
      if (field === "eyebrow") {
        debouncedUpdateEyebrow.flush();
      } else if (field === "title") {
        debouncedUpdateTitle.flush();
      } else if (field === "subtitle") {
        debouncedUpdateSubtitle.flush();
      }
    },
    [debouncedUpdateEyebrow, debouncedUpdateTitle, debouncedUpdateSubtitle]
  );

  const backgroundColor = widget.backgroundColor ?? "#ffffff";
  const backgroundType = widget.backgroundType ?? "solid";
  const textAlign = widget.textAlign ?? "center";

  const eyebrowColor = widget.eyebrowColor ?? "#2563eb";
  const titleColor = widget.titleColor ?? "#0f172a";
  const subtitleColor = widget.subtitleColor ?? "#475569";

  const eyebrowFontFamily = widget.eyebrowFontFamily ?? "var(--font-poppins)";
  const titleFontFamily = widget.titleFontFamily ?? "var(--font-poppins)";
  const subtitleFontFamily = widget.subtitleFontFamily ?? "var(--font-poppins)";

  const eyebrowFontSize = widget.eyebrowFontSize ?? 18;
  const titleFontSize = widget.titleFontSize ?? 72;
  const subtitleFontSize = widget.subtitleFontSize ?? 28;

  const toolbar = isSelected ? (
    <TitleCardEditingToolbar
      widget={widget}
      isEditing={isEditing}
      activeField={activeField}
      widgetRef={widgetRef}
      viewport={viewport}
      containerRef={containerRef}
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
      >
        <div
          className={cn(
            "flex h-full w-full flex-col items-center justify-center gap-3 text-center px-4",
            textAlign === "left" && "items-start text-left",
            textAlign === "right" && "items-end text-right"
          )}
        >
          <ProseMirrorEditor
            value={localEyebrow}
            onChange={(value) => {
              if (!isSelected) return;
              setLocalEyebrow(value);
              debouncedUpdateEyebrow(value);
            }}
            onFocus={() => {
              if (!isSelected) return;
              handleFieldFocus("eyebrow");
            }}
            onBlur={() => handleFieldBlur("eyebrow")}
            placeholder="Eyebrow text"
            readOnly={!isSelected}
            className={cn(
              "tracking-[0.2em] uppercase text-xs font-semibold w-full",
              isSelected ? "cursor-text" : "cursor-default"
            )}
            style={{
              color: eyebrowColor,
              fontFamily: eyebrowFontFamily,
              fontSize: eyebrowFontSize,
              wordWrap: "break-word",
              overflowWrap: "break-word",
              textAlign: textAlign,
            }}
          />

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
            placeholder="Add a powerful headline"
            readOnly={!isSelected}
            className={cn(
              "font-semibold leading-tight w-full",
              isSelected ? "cursor-text" : "cursor-default"
            )}
            style={{
              color: titleColor,
              fontFamily: titleFontFamily,
              fontSize: titleFontSize,
              lineHeight: 1.05,
              wordWrap: "break-word",
              overflowWrap: "break-word",
              textAlign: textAlign,
            }}
          />

          <ProseMirrorEditor
            value={localSubtitle}
            onChange={(value) => {
              if (!isSelected) return;
              setLocalSubtitle(value);
              debouncedUpdateSubtitle(value);
            }}
            onFocus={() => {
              if (!isSelected) return;
              handleFieldFocus("subtitle");
            }}
            onBlur={() => handleFieldBlur("subtitle")}
            placeholder="Add supporting context or a subtitle"
            readOnly={!isSelected}
            className={cn(
              "text-base leading-relaxed text-muted-foreground w-full",
              isSelected ? "cursor-text" : "cursor-default"
            )}
            style={{
              color: subtitleColor,
              fontFamily: subtitleFontFamily,
              fontSize: subtitleFontSize,
              maxWidth: textAlign === "center" ? "90%" : "100%",
              textAlign: textAlign,
              margin: textAlign === "center" ? "0 auto" : "0",
              wordWrap: "break-word",
              overflowWrap: "break-word",
            }}
          />
        </div>
      </WidgetBackground>
    </WidgetContainer>
  );
};

export const TitleCardWidgetNode = React.memo(TitleCardWidgetNodeBase);

type TitleCardEditingToolbarProps = {
  widget: TitleCardWidget;
  isEditing: boolean;
  activeField: ActiveField;
  widgetRef: React.RefObject<HTMLElement | null>;
  viewport: Viewport;
  containerRef: React.RefObject<HTMLElement | null>;
};

const TitleCardEditingToolbar: React.FC<TitleCardEditingToolbarProps> = ({
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

  const handleSetBackgroundType = (type: TitleCardWidget["backgroundType"]) => {
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
    const key =
      activeField === "eyebrow"
        ? "eyebrowColor"
        : activeField === "title"
        ? "titleColor"
        : "subtitleColor";

    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { [key]: color },
      })
    );
  };

  const handleSetFontFamily = (fontFamily: string) => {
    if (!activeField) return;
    const key =
      activeField === "eyebrow"
        ? "eyebrowFontFamily"
        : activeField === "title"
        ? "titleFontFamily"
        : "subtitleFontFamily";

    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { [key]: fontFamily },
      })
    );
  };

  const handleSetFontSize = (size: number) => {
    if (!activeField) return;
    const key =
      activeField === "eyebrow"
        ? "eyebrowFontSize"
        : activeField === "title"
        ? "titleFontSize"
        : "subtitleFontSize";

    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { [key]: size },
      })
    );
  };

  const handleAlign = (align: "left" | "center" | "right") => {
    if (align === (widget.textAlign ?? "center")) return;
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { textAlign: align },
      })
    );
  };

  const currentBackgroundColor = widget.backgroundColor ?? "#ffffff";
  const currentBackgroundType = widget.backgroundType ?? "solid";
  const currentAlign = widget.textAlign ?? "center";

  const currentTextColor =
    activeField === "eyebrow"
      ? widget.eyebrowColor ?? "#2563eb"
      : activeField === "title"
      ? widget.titleColor ?? "#0f172a"
      : activeField === "subtitle"
      ? widget.subtitleColor ?? "#475569"
      : "#0f172a";

  const currentFontFamily =
    activeField === "eyebrow"
      ? widget.eyebrowFontFamily ?? "var(--font-poppins)"
      : activeField === "title"
      ? widget.titleFontFamily ?? "var(--font-poppins)"
      : activeField === "subtitle"
      ? widget.subtitleFontFamily ?? "var(--font-poppins)"
      : "var(--font-poppins)";

  const currentFontSize =
    activeField === "eyebrow"
      ? widget.eyebrowFontSize ?? 18
      : activeField === "title"
      ? widget.titleFontSize ?? 72
      : widget.subtitleFontSize ?? 28;

  const controls: ToolbarControlConfig[] = [
    {
      type: "color-picker",
      config: {
        color: currentBackgroundColor,
        onChange: handleSetBackgroundColor,
        label: "Card Background",
      },
    },
    {
      type: "background-type",
      config: {
        value: currentBackgroundType,
        onChange: handleSetBackgroundType,
      },
    },
    {
      type: "color-picker",
      config: {
        color: currentTextColor,
        onChange: handleSetTextColor,
        label: "Text Color",
      },
      showWhen: (field) => !!field,
    },
    {
      type: "font-family",
      config: {
        value: currentFontFamily,
        onChange: handleSetFontFamily,
      },
      showWhen: (field) => !!field,
    },
    {
      type: "font-size",
      config: {
        value: currentFontSize,
        onChange: handleSetFontSize,
      },
      showWhen: (field) => !!field,
    },
    { type: "separator" },
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
      toolbarSelector="data-title-card-toolbar"
    />
  );
};
