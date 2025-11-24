"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronDown, Image as ImageIcon, Sparkles } from "lucide-react";
import type { ResizeHandle } from "@/components/editor/widgets/types";
import type { ImageCardWidget } from "./types";
import {
  TOOLBAR_SELECTOR,
  ALIGN_OPTIONS,
  GOOGLE_FONTS,
  FONT_SIZE_OPTIONS,
  BACKGROUND_TYPE_OPTIONS,
  IMAGE_STYLE_OPTIONS,
} from "./constants";
import { ResizeHandles } from "@/components/editor/resize-handles";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectActiveSlideId,
  updateWidget as updateWidgetAction,
} from "@/store/slices/slidesSlice";
import { useDebouncedCallback } from "use-debounce";
import type { Viewport } from "@/hooks/use-canvas-viewport";
import { ToolbarPortal } from "@/components/editor/toolbar-portal";
import { Popover } from "@headlessui/react";
import { PopoverPanelPortal } from "@/components/editor/background/popover-panel-portal";
import { HexColorPicker } from "react-colorful";
import { Input } from "@/components/ui/input";
import { ProseMirrorEditor } from "@/components/editor/prosemirror-editor";

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
  const widgetRef = React.useRef<HTMLDivElement>(null);

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

  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement;
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
      if (field === "title") {
        debouncedUpdateTitle.flush();
      } else if (field === "description") {
        debouncedUpdateDescription.flush();
      }
    },
    [debouncedUpdateDescription, debouncedUpdateTitle]
  );

  const backgroundColor = widget.backgroundColor ?? "#ffffff";
  const titleColor = widget.titleColor ?? "#0f172a";
  const descriptionColor = widget.descriptionColor ?? "#475569";
  const titleFontFamily = widget.titleFontFamily ?? "var(--font-poppins)";
  const descriptionFontFamily =
    widget.descriptionFontFamily ?? "var(--font-poppins)";
  const titleFontSize = widget.titleFontSize ?? 26;
  const descriptionFontSize = widget.descriptionFontSize ?? 18;
  const textAlign = widget.textAlign ?? "left";
  const backgroundType = widget.backgroundType ?? "solid";
  const isGlassBackground = backgroundType === "glass";
  const isTransparentBackground = backgroundType === "transparent";
  const imageStyle = widget.imageStyle ?? "hero";
  const isHeroImage = imageStyle === "hero";
  const useGlassPanel = imageStyle === "backgroundGlass";
  const imagePreviewUrl = localImageUrl.trim();

  const heroImageHeight = Math.max(220, widget.height * 0.55);
  const glassSurfaceGradient =
    "linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.02) 100%)";
  const glassSurfaceShadow =
    "inset 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 0 rgba(255, 255, 255, 0.25)";
  const heroSurfaceStyle = isGlassBackground
    ? {
        backgroundColor: `${backgroundColor}03`,
        backgroundImage: glassSurfaceGradient,
        boxShadow: glassSurfaceShadow,
      }
    : {
        backgroundColor: isTransparentBackground
          ? "transparent"
          : backgroundColor,
        boxShadow: "none",
      };
  const heroTextPanelClasses = cn(
    "flex flex-1 flex-col gap-3 px-8 pb-8 pt-6",
    isGlassBackground &&
      "border border-white/20 bg-white/10 backdrop-blur-2xl shadow-[0_40px_80px_-20px_rgba(15,23,42,0.5)] rounded-[24px]"
  );
  const heroTextPanelStyle = isGlassBackground
    ? {
        backgroundImage:
          "linear-gradient(180deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.04) 100%)",
      }
    : undefined;
  const glassOverlayClasses =
    "border border-white/20 bg-white/10 backdrop-blur-2xl shadow-[0_40px_80px_-20px_rgba(15,23,42,0.5)] rounded-[24px]";

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
          <ImageCardToolbar
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
            "relative h-full w-full overflow-hidden rounded-[32px] transition-all duration-300 ease-out shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)]",
            isHeroImage && isGlassBackground && "backdrop-blur-2xl",
            isHeroImage && isTransparentBackground && "bg-transparent shadow-none"
          )}
          style={isHeroImage ? heroSurfaceStyle : undefined}
        >
          {isHeroImage ? (
            <div className="flex h-full flex-col" style={{ textAlign }}>
              <div
                className="relative w-full overflow-hidden"
                style={{ height: heroImageHeight }}
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
              <div className={heroTextPanelClasses} style={heroTextPanelStyle}>
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
        </div>
        {isSelected && !isEditing && (
          <ResizeHandles getResizePointerDown={getResizePointerDown} />
        )}
      </div>
    </div>
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
  const bgColorPickerButtonRef = React.useRef<HTMLButtonElement>(null);
  const bgTypeButtonRef = React.useRef<HTMLButtonElement>(null);
  const textColorPickerButtonRef = React.useRef<HTMLButtonElement>(null);
  const fontButtonRef = React.useRef<HTMLButtonElement>(null);
  const fontSizeButtonRef = React.useRef<HTMLButtonElement>(null);
  const imageStyleButtonRef = React.useRef<HTMLButtonElement>(null);
  const fontMenuRef = React.useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const [fontMenuOpen, setFontMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        fontMenuOpen &&
        fontMenuRef.current &&
        !fontMenuRef.current.contains(target) &&
        fontButtonRef.current &&
        !fontButtonRef.current.contains(target)
      ) {
        setFontMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [fontMenuOpen]);

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
    style: "hero" | "background" | "backgroundGlass"
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
  const currentBackgroundColor = widget.backgroundColor ?? "#ffffff";
  const currentBackgroundType = widget.backgroundType ?? "solid";
  const currentImageStyle = widget.imageStyle ?? "hero";
  const currentTextColor =
    activeField === "title"
      ? widget.titleColor ?? "#0f172a"
      : activeField === "description"
      ? widget.descriptionColor ?? "#475569"
      : widget.titleColor ?? "#0f172a";
  const currentFontFamily =
    activeField === "title"
      ? widget.titleFontFamily ?? "var(--font-poppins)"
      : widget.descriptionFontFamily ?? "var(--font-poppins)";
  const currentFontLabel =
    GOOGLE_FONTS.find((font) => font.value === currentFontFamily)?.label ??
    "Poppins";
  const currentFontSize =
    activeField === "title"
      ? widget.titleFontSize ?? 26
      : widget.descriptionFontSize ?? 18;
  const currentFontSizeLabel =
    FONT_SIZE_OPTIONS.find((option) => option.value === currentFontSize)
      ?.label ?? `${currentFontSize}px`;
  const currentBackgroundTypeLabel =
    BACKGROUND_TYPE_OPTIONS.find(
      (option) => option.value === currentBackgroundType
    )?.label ?? "Solid";
  const currentImageStyleLabel =
    IMAGE_STYLE_OPTIONS.find((option) => option.value === currentImageStyle)
      ?.label ?? "Hero Image";

  return (
    <ToolbarPortal
      widgetRef={widgetRef}
      viewport={viewport}
      containerRef={containerRef}
      placement={isEditing ? "bottom" : "top"}
      offset={isEditing ? 12 : 16}
    >
      <div
        data-image-card-toolbar="true"
        className="pointer-events-auto flex flex-wrap items-center gap-3 rounded-2xl border border-white/20 bg-white/80 px-3.5 py-1.5 shadow-[0_6px_30px_-14px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-all duration-300 hover:bg-white/90 hover:shadow-[0_10px_38px_-14px_rgba(0,0,0,0.3)]"
        onPointerDown={(event) => {
          event.stopPropagation();
        }}
      >
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

        <div className="h-5 w-px bg-black/10 rounded-full" />

        {/* Background */}
        <div className="flex items-center gap-2">
          <Popover>
            {({ open }) => (
              <>
                <Popover.Button
                  ref={bgColorPickerButtonRef}
                  className="relative h-6 w-6 rounded-full ring-1 ring-black/5 transition-all hover:scale-110 focus:outline-none"
                  style={{ backgroundColor: currentBackgroundColor }}
                >
                  <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/5" />
                </Popover.Button>
                {open && (
                  <PopoverPanelPortal buttonRef={bgColorPickerButtonRef}>
                    <div className="flex flex-col gap-3 rounded-2xl border border-white/20 bg-white/95 p-3 shadow-2xl backdrop-blur-2xl min-w-[240px]">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                        Background
                      </div>
                      <HexColorPicker
                        color={currentBackgroundColor}
                        onChange={handleSetBackgroundColor}
                        className="h-32! w-full! rounded-xl"
                      />
                      <div className="flex items-center gap-2 rounded-lg border border-black/5 bg-muted/30 p-1.5">
                        <div
                          className="h-6 w-6 rounded-full border border-black/10 shadow-sm"
                          style={{ backgroundColor: currentBackgroundColor }}
                        />
                        <Input
                          className="h-7 flex-1 border-none bg-transparent text-xs font-mono uppercase text-muted-foreground focus-visible:ring-0"
                          value={currentBackgroundColor}
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                          ) => handleSetBackgroundColor(event.target.value)}
                        />
                      </div>
                    </div>
                  </PopoverPanelPortal>
                )}
              </>
            )}
          </Popover>

          <Popover>
            {({ open }) => (
              <>
                <Popover.Button
                  ref={bgTypeButtonRef}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-muted-foreground/80 transition-all hover:bg-black/10",
                    open && "bg-black/10 text-foreground"
                  )}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{currentBackgroundTypeLabel}</span>
                  <ChevronDown className="h-3 w-3" />
                </Popover.Button>
                {open && (
                  <PopoverPanelPortal buttonRef={bgTypeButtonRef}>
                    <div className="flex flex-col gap-1.5 rounded-xl border border-white/20 bg-white/95 p-3 shadow-2xl backdrop-blur-xl min-w-[200px]">
                      {BACKGROUND_TYPE_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          className={cn(
                            "flex flex-col rounded-lg px-3 py-2 text-xs text-left transition-all",
                            option.value === currentBackgroundType
                              ? "bg-black/5 text-foreground font-semibold"
                              : "text-muted-foreground hover:bg-black/5 hover:text-foreground"
                          )}
                          onClick={() => handleSetBackgroundType(option.value)}
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
        </div>

        {activeField && (
          <>
            <div className="h-5 w-px bg-black/10 rounded-full" />
            <div className="flex items-center gap-2">
              <Popover>
                {({ open }) => (
                  <>
                    <Popover.Button
                      ref={textColorPickerButtonRef}
                      className="relative h-6 w-6 rounded-full ring-1 ring-black/5 transition-all hover:scale-110 focus:outline-none"
                      style={{ backgroundColor: currentTextColor }}
                    >
                      <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/5" />
                    </Popover.Button>
                    {open && (
                      <PopoverPanelPortal buttonRef={textColorPickerButtonRef}>
                        <div className="flex flex-col gap-3 rounded-2xl border border-white/20 bg-white/95 p-3 shadow-2xl backdrop-blur-2xl min-w-[240px]">
                          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                            {activeField} Color
                          </div>
                          <HexColorPicker
                            color={currentTextColor}
                            onChange={handleSetTextColor}
                            className="h-32! w-full! rounded-xl"
                          />
                          <div className="flex items-center gap-2 rounded-lg border border-black/5 bg-muted/30 p-1.5">
                            <div
                              className="h-6 w-6 rounded-full border border-black/10 shadow-sm"
                              style={{ backgroundColor: currentTextColor }}
                            />
                            <Input
                              className="h-7 flex-1 border-none bg-transparent text-xs font-mono uppercase text-muted-foreground focus-visible:ring-0"
                              value={currentTextColor}
                              onChange={(
                                event: React.ChangeEvent<HTMLInputElement>
                              ) => handleSetTextColor(event.target.value)}
                            />
                          </div>
                        </div>
                      </PopoverPanelPortal>
                    )}
                  </>
                )}
              </Popover>

              <div className="relative flex items-center">
                <Button
                  ref={fontButtonRef}
                  variant="ghost"
                  size="sm"
                  className="group flex w-[110px] items-center justify-between gap-2 rounded-full border border-transparent bg-black/5 px-3 py-1.5 text-xs hover:bg-black/10"
                  onClick={() => setFontMenuOpen((prev) => !prev)}
                >
                  <span className="truncate text-[11px] font-medium text-foreground/80 group-hover:text-foreground">
                    {currentFontLabel}
                  </span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </Button>
                {fontMenuOpen && (
                  <div
                    ref={fontMenuRef}
                    className="absolute left-0 top-full mt-2 z-50 max-h-[280px] min-w-[200px] overflow-y-auto rounded-xl border border-white/20 bg-white/90 p-1.5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] backdrop-blur-xl"
                  >
                    <div className="flex flex-col gap-0.5">
                      {GOOGLE_FONTS.map((font) => (
                        <button
                          key={font.value}
                          type="button"
                          className={cn(
                            "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all",
                            currentFontFamily === font.value
                              ? "bg-black/5 text-foreground font-medium"
                              : "text-muted-foreground hover:bg-black/5 hover:text-foreground"
                          )}
                          style={{ fontFamily: font.style }}
                          onClick={() => {
                            handleSetFontFamily(font.value);
                            setFontMenuOpen(false);
                          }}
                        >
                          <span>{font.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Popover>
                {({ open }) => (
                  <>
                    <Popover.Button
                      ref={fontSizeButtonRef}
                      className={cn(
                        "flex items-center gap-1 rounded-full bg-black/5 px-3 py-1.5 text-xs font-medium text-foreground/80 transition-all hover:bg-black/10",
                        open && "bg-black/10 text-foreground"
                      )}
                    >
                      <span className="uppercase tracking-wide text-[10px]">
                        {currentFontSizeLabel}
                      </span>
                      <ChevronDown className="h-3 w-3" />
                    </Popover.Button>
                    {open && (
                      <PopoverPanelPortal buttonRef={fontSizeButtonRef}>
                        <div className="flex flex-col gap-1 rounded-xl border border-white/20 bg-white/95 p-2 shadow-2xl backdrop-blur-xl min-w-[160px]">
                          {FONT_SIZE_OPTIONS.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              className={cn(
                                "flex items-center justify-between rounded-lg px-3 py-2 text-xs transition-all",
                                option.value === currentFontSize
                                  ? "bg-black/5 text-foreground font-semibold"
                                  : "text-muted-foreground hover:bg-black/5 hover:text-foreground"
                              )}
                              onClick={() => handleSetFontSize(option.value)}
                            >
                              <span>{option.label}</span>
                              <span className="text-[10px] uppercase">
                                {option.value}px
                              </span>
                            </button>
                          ))}
                        </div>
                      </PopoverPanelPortal>
                    )}
                  </>
                )}
              </Popover>
            </div>
          </>
        )}

        <div className="h-5 w-px bg-black/10 rounded-full" />

        <div className="flex items-center gap-1 rounded-full bg-black/5 p-1">
          {ALIGN_OPTIONS.map(({ value, icon: Icon, label }) => (
            <Button
              key={value}
              variant="ghost"
              size="icon-sm"
              className={cn(
                "h-7 w-7 rounded-full transition-all",
                currentAlign === value
                  ? "bg-white text-foreground shadow-sm ring-1 ring-black/5"
                  : "text-muted-foreground hover:bg-black/5 hover:text-foreground"
              )}
              onClick={() => handleAlign(value)}
              aria-pressed={currentAlign === value}
              title={label}
            >
              <Icon className="h-3.5 w-3.5" />
            </Button>
          ))}
        </div>
      </div>
    </ToolbarPortal>
  );
};

export const ImageCardWidgetNode = React.memo(ImageCardWidgetNodeBase);
