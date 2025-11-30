"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Image as ImageIcon } from "lucide-react";
import type { ResizeHandle } from "@/components/editor/widgets/types";
import type { ImageCardWidget } from "./types";
import { TOOLBAR_SELECTOR, IMAGE_STYLE_OPTIONS } from "./constants";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectActiveSlideId,
  selectGlobalTheme,
  updateWidget as updateWidgetAction,
} from "@/store/slices/slidesSlice";
import { useDebouncedCallback } from "use-debounce";
import type { Viewport } from "@/hooks/use-canvas-viewport";
import { Popover } from "@headlessui/react";
import { PopoverPanelPortal } from "@/components/editor/background/popover-panel-portal";
import { ProseMirrorEditor } from "@/components/editor/prosemirror-editor";
import { WidgetToolbar } from "@/components/editor/widgets/shared/toolbar-controls/widget-toolbar";
import type { ToolbarControlConfig } from "@/components/editor/widgets/shared/toolbar-controls/types";
import {
  WidgetContainer,
  WidgetBackground,
  useWidgetPointerDown,
} from "@/components/editor/widgets/shared";

type ImageCardWidgetNodeProps = {
  widget: ImageCardWidget;
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

type ActiveField = "title" | "description" | null;

const ImageCardWidgetNodeBase: React.FC<ImageCardWidgetNodeProps> = ({
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
  const globalTheme = useAppSelector(selectGlobalTheme);
  const widgetRef = React.useRef<HTMLDivElement | null>(null);

  const [localTitle, setLocalTitle] = React.useState(widget.title || "");
  const [localDescription, setLocalDescription] = React.useState(
    widget.description || ""
  );
  const [localImageUrl, setLocalImageUrl] = React.useState(
    widget.imageUrl || ""
  );
  const [activeField, setActiveField] = React.useState<ActiveField>(null);

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
    setLocalImageUrl((prev) =>
      prev === (widget.imageUrl || "") ? prev : widget.imageUrl || ""
    );
  }, [widget.imageUrl]);

  React.useEffect(() => {
    return () => {
      debouncedUpdateTitle.flush();
      debouncedUpdateDescription.flush();
    };
  }, [debouncedUpdateDescription, debouncedUpdateTitle]);

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
      if (field === "title") {
        debouncedUpdateTitle.flush();
      } else if (field === "description") {
        debouncedUpdateDescription.flush();
      }
    },
    [debouncedUpdateDescription, debouncedUpdateTitle]
  );

  const backgroundColor = widget.backgroundColor ?? undefined;
  const titleColor = widget.titleColor ?? globalTheme?.text ?? "#0f172a";
  const descriptionColor =
    widget.descriptionColor ?? globalTheme?.text ?? "#475569";
  const titleFontFamily =
    widget.titleFontFamily ?? globalTheme?.font ?? "var(--font-poppins)";
  const descriptionFontFamily =
    widget.descriptionFontFamily ?? globalTheme?.font ?? "var(--font-poppins)";
  const titleFontSize = widget.titleFontSize ?? 26;
  const descriptionFontSize = widget.descriptionFontSize ?? 18;
  const textAlign = widget.textAlign ?? "left";
  const backgroundType = widget.backgroundType ?? "solid";
  const imageStyle = widget.imageStyle ?? "hero";
  const isHeroImage = imageStyle === "hero";
  const useGlassPanel = imageStyle === "backgroundGlass";
  const imagePreviewUrl = localImageUrl.trim();

  const heroImageHeight = Math.max(220, widget.height * 0.55);
  const heroTextPanelClasses = "flex flex-1 flex-col gap-3 px-8 pb-8 pt-6";
  const glassOverlayClasses =
    "border border-white/20 bg-white/10 backdrop-blur-2xl shadow-[0_40px_80px_-20px_rgba(15,23,42,0.5)] rounded-[12px]";

  // Determine if we should use WidgetBackground (for hero/left/right/bottom styles)
  const shouldUseWidgetBackground =
    isHeroImage ||
    imageStyle === "left" ||
    imageStyle === "right" ||
    imageStyle === "bottom";

  const toolbar = isSelected ? (
    <ImageCardToolbar
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
      {shouldUseWidgetBackground ? (
        <WidgetBackground
          backgroundType={backgroundType}
          backgroundColor={backgroundColor}
          className="overflow-hidden p-0"
        >
          <div
            className={cn(
              "flex h-full",
              isHeroImage
                ? "flex-col"
                : imageStyle === "bottom"
                ? "flex-col-reverse"
                : imageStyle === "right"
                ? "flex-row-reverse"
                : "flex-row"
            )}
            style={{ textAlign }}
          >
            <div
              className="relative overflow-hidden"
              style={{
                width: isHeroImage || imageStyle === "bottom" ? "100%" : "50%",
                height:
                  isHeroImage || imageStyle === "bottom"
                    ? heroImageHeight
                    : "100%",
              }}
            >
              {imagePreviewUrl ? (
                <img
                  src={imagePreviewUrl}
                  alt={widget.title || "Card image"}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted/30 text-muted-foreground/80">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/70 text-foreground/70 shadow-inner">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-semibold tracking-wide uppercase">
                    Add an image
                  </p>
                  <p className="text-[11px] text-muted-foreground/80">
                    Use the toolbar to paste a link
                  </p>
                </div>
              )}
            </div>
            <div
              className={cn(
                heroTextPanelClasses,
                !isHeroImage &&
                  imageStyle !== "bottom" &&
                  "w-1/2 justify-center",
                imageStyle === "bottom" && "justify-end pb-6 pt-8"
              )}
            >
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
                placeholder="Add a headline"
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
                  lineHeight: 1.2,
                  textAlign,
                }}
              />

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
                placeholder="Write a supporting description."
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
                  textAlign,
                }}
              />
            </div>
          </div>
        </WidgetBackground>
      ) : (
        <div className="relative flex h-full w-full flex-col justify-end">
          <div className="absolute inset-0">
            {imagePreviewUrl ? (
              <img
                src={imagePreviewUrl}
                alt={widget.title || "Background image"}
                className="h-full w-full object-cover"
                draggable={false}
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted/30 text-muted-foreground/80">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/70 text-foreground/70 shadow-inner">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold tracking-wide uppercase">
                  Add an image
                </p>
                <p className="text-[11px] text-muted-foreground/80">
                  Use the toolbar to paste a link
                </p>
              </div>
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />
          </div>

          <div
            className="relative z-10 flex flex-col gap-3 p-6"
            style={{ textAlign }}
          >
            <div
              className={cn(
                "flex flex-col gap-3 p-5",
                useGlassPanel
                  ? glassOverlayClasses
                  : "text-white drop-shadow-lg"
              )}
              style={
                useGlassPanel
                  ? {
                      backgroundImage:
                        "linear-gradient(180deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.04) 100%)",
                    }
                  : undefined
              }
            >
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
                placeholder="Add a headline"
                readOnly={!isSelected}
                className={cn(
                  "w-full",
                  isSelected ? "cursor-text" : "cursor-default"
                )}
                style={{
                  fontSize: `${titleFontSize}px`,
                  fontWeight: 600,
                  color: useGlassPanel ? titleColor : "#f8fafc",
                  fontFamily: titleFontFamily,
                  lineHeight: 1.2,
                  textAlign,
                }}
              />

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
                placeholder="Write a supporting description."
                readOnly={!isSelected}
                className={cn(
                  "w-full",
                  isSelected ? "cursor-text" : "cursor-default"
                )}
                style={{
                  fontSize: `${descriptionFontSize}px`,
                  color: useGlassPanel
                    ? descriptionColor
                    : "rgba(248,250,252,0.9)",
                  fontFamily: descriptionFontFamily,
                  lineHeight: 1.5,
                  textAlign,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </WidgetContainer>
  );
};

type ImageCardToolbarProps = {
  widget: ImageCardWidget;
  isEditing: boolean;
  activeField: ActiveField;
  widgetRef: React.RefObject<HTMLElement | null>;
  viewport: Viewport;
  containerRef: React.RefObject<HTMLElement | null>;
};

const ImageCardToolbar: React.FC<ImageCardToolbarProps> = ({
  widget,
  isEditing,
  activeField,
  widgetRef,
  viewport,
  containerRef,
}) => {
  const imageStyleButtonRef = React.useRef<HTMLButtonElement>(null);
  const dispatch = useAppDispatch();
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const globalTheme = useAppSelector(selectGlobalTheme);

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
    value: "solid" | "glass" | "transparent"
  ) => {
    if (value === widget.backgroundType) return;
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { backgroundType: value },
      })
    );
  };

  const handleSetTextColor = (color: string) => {
    if (!activeField) return;
    const key =
      activeField === "title" ? "titleColor" : ("descriptionColor" as const);
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { [key]: color },
      })
    );
  };

  const handleSetFontFamily = (font: string) => {
    if (!activeField) return;
    const key =
      activeField === "title"
        ? "titleFontFamily"
        : ("descriptionFontFamily" as const);
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { [key]: font },
      })
    );
  };

  const handleSetFontSize = (size: number) => {
    if (!activeField) return;
    const key =
      activeField === "title"
        ? "titleFontSize"
        : ("descriptionFontSize" as const);
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { [key]: size },
      })
    );
  };

  const handleAlign = (align: "left" | "center" | "right") => {
    if (align === (widget.textAlign ?? "left")) return;
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { textAlign: align },
      })
    );
  };

  const handleSetImageStyle = (
    style:
      | "hero"
      | "background"
      | "backgroundGlass"
      | "left"
      | "right"
      | "bottom"
  ) => {
    if (style === (widget.imageStyle ?? "hero")) return;
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { imageStyle: style },
      })
    );
  };

  const currentAlign = widget.textAlign ?? "left";
  const currentBackgroundColor =
    widget.backgroundColor ?? globalTheme?.surface ?? "#ffffff";
  const currentBackgroundType = widget.backgroundType ?? "solid";
  const currentImageStyle = widget.imageStyle ?? "hero";
  const currentTextColor =
    activeField === "title"
      ? widget.titleColor ?? globalTheme?.text ?? "#0f172a"
      : activeField === "description"
      ? widget.descriptionColor ?? globalTheme?.text ?? "#475569"
      : widget.titleColor ?? globalTheme?.text ?? "#0f172a";
  const currentFontFamily =
    activeField === "title"
      ? widget.titleFontFamily ?? globalTheme?.font ?? "var(--font-poppins)"
      : widget.descriptionFontFamily ??
        globalTheme?.font ??
        "var(--font-poppins)";
  const currentFontSize =
    activeField === "title"
      ? widget.titleFontSize ?? 26
      : widget.descriptionFontSize ?? 18;

  const currentImageStyleLabel =
    IMAGE_STYLE_OPTIONS.find((option) => option.value === currentImageStyle)
      ?.label ?? "Hero Image";

  // Image style selector custom control
  const imageStyleControl = (
    <Popover>
      {({ open }) => (
        <>
          <Popover.Button
            ref={imageStyleButtonRef}
            className={cn(
              "flex items-center gap-1.5 rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-muted-foreground/80 transition-all hover:bg-black/10",
              open && "bg-black/10 text-foreground"
            )}
          >
            <span>{currentImageStyleLabel}</span>
            <ChevronDown className="h-3 w-3" />
          </Popover.Button>
          {open && (
            <PopoverPanelPortal buttonRef={imageStyleButtonRef}>
              <div className="flex flex-col gap-1.5 rounded-xl border border-white/20 bg-white/95 p-2 shadow-2xl backdrop-blur-xl min-w-[220px]">
                {IMAGE_STYLE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={cn(
                      "flex flex-col rounded-lg px-3 py-2 text-xs text-left transition-all",
                      option.value === currentImageStyle
                        ? "bg-black/5 text-foreground font-semibold"
                        : "text-muted-foreground hover:bg-black/5 hover:text-foreground"
                    )}
                    onClick={() => handleSetImageStyle(option.value)}
                  >
                    <span>{option.label}</span>
                    <span className="text-[10px] opacity-70">
                      {option.description}
                    </span>
                  </button>
                ))}
              </div>
            </PopoverPanelPortal>
          )}
        </>
      )}
    </Popover>
  );

  const controls: ToolbarControlConfig[] = [
    // Image style selector (custom)
    {
      type: "custom",
      customRender: () => imageStyleControl,
    },
    { type: "separator" },
    // Background color picker
    {
      type: "color-picker",
      config: {
        color: currentBackgroundColor,
        onChange: handleSetBackgroundColor,
        label: "Background",
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
      toolbarSelector="data-image-card-toolbar"
    />
  );
};

export const ImageCardWidgetNode = React.memo(ImageCardWidgetNodeBase);
