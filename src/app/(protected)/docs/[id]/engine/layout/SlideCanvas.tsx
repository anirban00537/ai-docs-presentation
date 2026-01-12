import React, {
  useState,
  memo,
  useCallback,
  lazy,
  Suspense,
  useEffect,
  useRef,
} from "react";
import { useDroppable, useDndMonitor } from "@dnd-kit/core";
import { ContentRow } from "./ContentRow";
import type { Slide, SlideAccent } from "@/store/slices/slidesSlice";
import type { BlockContent } from "@/types/presentation";
import { useAppDispatch } from "@/store/hooks";
import {
  setSlideAccentSize,
  updateSlideAccent,
} from "@/store/slices/slidesSlice";
import { useEditorTheme } from "@/app/(protected)/docs/[id]/engine/theme/EditorThemeProvider";
import { SlideToolbar } from "@/app/(protected)/docs/[id]/editor/slide/SlideToolbar";
import type { SelectedImage } from "@/app/(protected)/docs/[id]/editor/panels/ImagePickerModal";
import { getFontFamily } from "@/lib/fonts";
import { SLIDE_MAX_WIDTH } from "@/lib/constants";
import * as Patterns from "@/app/(protected)/docs/[id]/editor/patterns";
import { useResize } from "@/app/(protected)/docs/[id]/engine/hooks/useResize";
import { DragStateBridge } from "./DragStateBridge";
import { InsertDropZone } from "./InsertDropZone";
import { cn } from "@/lib/utils";

// Lazy load the heavy ImagePickerModal
const ImagePickerModal = lazy(() =>
  import("@/app/(protected)/docs/[id]/editor/panels/ImagePickerModal").then(
    (mod) => ({ default: mod.ImagePickerModal })
  )
);

interface SlideCanvasProps {
  slide: Slide;
  onUpdateBlock: (
    slideId: string,
    blockId: string,
    content: BlockContent
  ) => void;
  onDeleteRow: (slideId: string, rowId: string) => void;
  onAddColumn: (slideId: string, rowId: string, afterBlockId: string) => void;
  onAddRowAtTop: (slideId: string) => void;
  onAddRowAtBottom: (slideId: string) => void;
  onUpdateColumnWidths: (
    slideId: string,
    rowId: string,
    columnWidths: number[]
  ) => void;
  onUpdateAccent?: (slideId: string, accent: SlideAccent | undefined) => void;
  enableDragHints?: boolean;
  readOnly?: boolean;
  fullWidth?: boolean;
}

export const SlideCanvas = memo(function SlideCanvas({
  slide,
  onUpdateBlock,
  onDeleteRow,
  onAddColumn,
  onAddRowAtTop,
  onAddRowAtBottom,
  onUpdateColumnWidths,
  onUpdateAccent,
  enableDragHints = true,
  readOnly = false,
  fullWidth = false,
}: SlideCanvasProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [localAccentSize, setLocalAccentSize] = useState(
    slide.accent?.size || 40
  );
  const latestSizeRef = useRef<number>(slide.accent?.size || 40);
  const [prevAccentSize, setPrevAccentSize] = useState(slide.accent?.size);

  const theme = useEditorTheme();
  const dispatch = useAppDispatch();
  const isDark = theme.themeType === "dark";
  const dragActive = enableDragHints ? isDragging : false;

  // Sync local accent size when prop changes (React recommended pattern)
  if (slide.accent?.size !== prevAccentSize) {
    setPrevAccentSize(slide.accent?.size);
    if (slide.accent?.size !== undefined) {
      setLocalAccentSize(slide.accent.size);
    }
  }

  // Keep ref in sync (refs can be updated in effects)
  useEffect(() => {
    latestSizeRef.current = localAccentSize;
  }, [localAccentSize]);

  // Accent resize hook
  const {
    isResizing: isResizingAccent,
    handleMouseDown: handleAccentResizeStart,
  } = useResize({
    direction:
      slide.accent?.position === "top" || slide.accent?.position === "bottom"
        ? "vertical"
        : "horizontal",
    onResize: (delta) => {
      if (slide.accent?.position === "background") return;

      const container = document.getElementById(`card-content-${slide.id}`);
      if (!container) return;

      const isVertical =
        slide.accent?.position === "top" || slide.accent?.position === "bottom";
      const containerDimension = isVertical
        ? container.offsetHeight
        : container.offsetWidth;
      if (containerDimension === 0) return;

      setLocalAccentSize((prev) => {
        const deltaPercent = (delta / containerDimension) * 100;
        let newSize =
          slide.accent?.position === "right" ||
          slide.accent?.position === "bottom"
            ? prev - deltaPercent
            : prev + deltaPercent;

        newSize = Math.max(5, Math.min(100, newSize));
        latestSizeRef.current = newSize;
        return newSize;
      });
    },
    onResizeEnd: () => {
      dispatch(
        setSlideAccentSize({ slideId: slide.id, size: latestSizeRef.current })
      );
    },
  });

  const handleAccentImageSelect = useCallback(
    (image: SelectedImage) => {
      if (onUpdateAccent) {
        const updatedAccent = {
          position: slide.accent?.position || ("right" as const),
          size: slide.accent?.size || 40,
          url: image.url,
        };
        onUpdateAccent(slide.id, updatedAccent);
      } else {
        dispatch(
          updateSlideAccent({
            slideId: slide.id,
            update: { url: image.url },
          })
        );
      }
      setIsImagePickerOpen(false);
    },
    [dispatch, slide.id, slide.accent, onUpdateAccent]
  );

  // Frame styling
  const getStyle = (): React.CSSProperties => {
    const opacity = theme.cardOpacity !== undefined ? theme.cardOpacity : 1;
    const backdropBlur = theme.cardBackdropBlur || "0px";

    const baseStyle: React.CSSProperties = {
      transition: isResizingAccent
        ? "none"
        : "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      backgroundColor:
        opacity < 1
          ? `rgba(${isDark ? "0, 0, 0" : "255, 255, 255"}, ${opacity})`
          : theme.pageBackground,
      fontFamily: getFontFamily(theme.fontFamily || "Inter"),
      position: "relative",
      backdropFilter: backdropBlur !== "0px" ? `blur(${backdropBlur})` : "none",
      WebkitBackdropFilter:
        backdropBlur !== "0px" ? `blur(${backdropBlur})` : "none",
      minWidth: fullWidth ? "100%" : `${SLIDE_MAX_WIDTH}px`,
      maxWidth: fullWidth ? "100%" : `${SLIDE_MAX_WIDTH}px`,
      overflow: "visible",
      display: fullWidth ? "flex" : "block",
      flexDirection: fullWidth ? "column" : undefined,
      justifyContent: fullWidth ? "center" : undefined,
    };

    const borderRadius = fullWidth ? "0px" : theme.cardBorderRadius || "12px";
    const boxShadow =
      theme.cardBoxShadow ||
      (isDark
        ? "0 4px 20px rgba(0, 0, 0, 0.4)"
        : "0 4px 12px rgba(0, 0, 0, 0.08)");

    const borderWidth = theme.cardBorderWidth || "0px";
    const borderStyle = fullWidth ? "none" : theme.cardBorderStyle || "solid";
    const borderColor =
      theme.borderColor ||
      (isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)");

    const border =
      !fullWidth && borderWidth !== "0px" && borderStyle !== "none"
        ? `${borderWidth} ${borderStyle} ${borderColor}`
        : "none";

    return {
      ...baseStyle,
      borderRadius,
      boxShadow: fullWidth ? "none" : boxShadow,
      border,
      backgroundColor: fullWidth ? "transparent" : baseStyle.backgroundColor,
    };
  };

  const finalStyle = getStyle();
  const borderRadius = finalStyle.borderRadius;

  const renderPattern = () => {
    const pattern = theme.cardDesignPattern;
    if (!pattern || pattern === "none") return null;

    switch (pattern) {
      case "gaussian":
        return (
          <Patterns.Gaussian
            primary={theme.primary}
            secondary={theme.secondaryColors}
          />
        );
      case "fractal":
        return (
          <Patterns.Fractal
            primary={theme.primary}
            secondary={theme.secondaryColors}
          />
        );
      case "fluid":
        return (
          <Patterns.Fluid
            primary={theme.primary}
            secondary={theme.secondaryColors}
          />
        );
      case "prism":
        return (
          <Patterns.Prism
            primary={theme.primary}
            secondary={theme.secondaryColors}
          />
        );
      case "beams":
        return (
          <Patterns.Beams
            primary={theme.primary}
            secondary={theme.secondaryColors}
          />
        );
      case "aurora":
        return (
          <Patterns.Aurora
            primary={theme.primary}
            secondary={theme.secondaryColors}
          />
        );
      case "nebula":
        return (
          <Patterns.Nebula
            primary={theme.primary}
            secondary={theme.secondaryColors}
          />
        );
      case "ether":
        return (
          <Patterns.Ether
            primary={theme.primary}
            secondary={theme.secondaryColors}
          />
        );
      case "lumina":
        return (
          <Patterns.Lumina
            primary={theme.primary}
            secondary={theme.secondaryColors}
          />
        );
      case "horizon":
        return (
          <Patterns.Horizon
            primary={theme.primary}
            secondary={theme.secondaryColors}
          />
        );
      case "pulse":
        return (
          <Patterns.Pulse
            primary={theme.primary}
            secondary={theme.secondaryColors}
          />
        );
      case "vortex":
        return (
          <Patterns.Vortex
            primary={theme.primary}
            secondary={theme.secondaryColors}
          />
        );
      case "echo":
        return (
          <Patterns.Echo
            primary={theme.primary}
            secondary={theme.secondaryColors}
          />
        );
      case "apex":
        return (
          <Patterns.Apex
            primary={theme.primary}
            secondary={theme.secondaryColors}
          />
        );
      case "arch":
        return (
          <Patterns.Arch
            primary={theme.primary}
            secondary={theme.secondaryColors}
          />
        );
      default:
        return null;
    }
  };

  const isVertical =
    slide.accent?.position === "top" || slide.accent?.position === "bottom";
  const isBackground = slide.accent?.position === "background";

  return (
    <>
      <div
        className={`group/slide relative z-0 hover:z-20 ${
          fullWidth ? "w-full min-h-screen" : "mx-auto"
        }`}
        style={finalStyle}
        onMouseEnter={!readOnly ? () => setIsHovered(true) : undefined}
        onMouseLeave={!readOnly ? () => setIsHovered(false) : undefined}
      >
        {/* Background layer */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{
            borderRadius,
            ...(fullWidth ? { height: "100%", width: "100%" } : {}),
          }}
        >
          <div
            style={{ opacity: theme.cardDesignPatternOpacity ?? 1 }}
            className="absolute inset-0"
          >
            {renderPattern()}
          </div>

          {/* Background Image Mode */}
          {isBackground && slide.accent?.url && (
            <div className="absolute inset-0">
              <img
                src={slide.accent.url}
                alt="Background Accent"
                className="w-full h-full object-cover transition-opacity duration-500"
                style={{ opacity: (slide.accent.size ?? 40) / 100 }}
              />
              <div
                className={`absolute inset-0 ${
                  isDark ? "bg-black/20" : "bg-white/10"
                }`}
              />
            </div>
          )}

          {(theme.cardNoiseOpacity ?? 0) > 0 && (
            <div
              className="absolute inset-0 mix-blend-overlay pointer-events-none"
              style={{
                opacity: theme.cardNoiseOpacity,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                backgroundSize: "100px 100px",
              }}
            />
          )}

          {(theme.cardVignetteOpacity ?? 0) > 0 && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle, transparent 30%, rgba(0,0,0,${theme.cardVignetteOpacity}) 100%)`,
              }}
            />
          )}
        </div>

        {enableDragHints && !readOnly && (
          <DragStateBridge onDragChange={setIsDragging} />
        )}

        {/* Slide Controls */}
        {!readOnly && (
          <SlideToolbar
            slide={slide}
            isHovered={isHovered}
            fullWidth={fullWidth}
            onOpenImagePicker={() => setIsImagePickerOpen(true)}
            onAddRow={() => onAddRowAtBottom(slide.id)}
            onUpdateAccent={onUpdateAccent}
            onToggleAccent={
              onUpdateAccent
                ? (slideId) => {
                    if (slide.accent) {
                      onUpdateAccent(slideId, undefined);
                    } else {
                      onUpdateAccent(slideId, {
                        position: "right",
                        size: 40,
                        url: undefined,
                      });
                    }
                  }
                : undefined
            }
          />
        )}

        <div
          id={`card-content-${slide.id}`}
          className={`relative z-10 w-full flex items-stretch ${
            slide.accent?.position === "right"
              ? "flex-row-reverse"
              : slide.accent?.position === "bottom"
              ? "flex-col-reverse"
              : slide.accent?.position === "top"
              ? "flex-col"
              : "flex-row"
          }`}
          style={{
            borderRadius,
            minHeight: fullWidth ? "100vh" : "auto",
          }}
        >
          {slide.accent && slide.accent.url && !isBackground && (
            <div
              className="relative shrink-0 group/accent z-0"
              style={{
                width: isVertical ? "100%" : `${localAccentSize}%`,
                height: isVertical ? `${localAccentSize}%` : "auto",
                minHeight: isVertical ? "200px" : fullWidth ? "100vh" : "auto",
                overflow: "hidden",
                borderTopLeftRadius:
                  slide.accent.position === "left" ||
                  slide.accent.position === "top"
                    ? borderRadius
                    : "0",
                borderBottomLeftRadius:
                  slide.accent.position === "left" ||
                  slide.accent.position === "bottom"
                    ? borderRadius
                    : "0",
                borderTopRightRadius:
                  slide.accent.position === "right" ||
                  slide.accent.position === "top"
                    ? borderRadius
                    : "0",
                borderBottomRightRadius:
                  slide.accent.position === "right" ||
                  slide.accent.position === "bottom"
                    ? borderRadius
                    : "0",
              }}
            >
              {slide.accent.url && (
                <img
                  src={slide.accent.url}
                  alt="Accent"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/10 transition-opacity opacity-0 group-hover/accent:opacity-100" />

              {/* Resize Handle */}
              {!readOnly && (
                <div
                  onMouseDown={handleAccentResizeStart}
                  className={`absolute z-50 transition-all duration-300 ${
                    isVertical
                      ? `left-0 w-full h-[1px] cursor-row-resize ${
                          slide.accent.position === "top" ? "bottom-0" : "top-0"
                        }`
                      : `top-0 w-[1px] h-full cursor-col-resize ${
                          slide.accent.position === "left"
                            ? "right-0"
                            : "left-0"
                        }`
                  } ${
                    isResizingAccent
                      ? "opacity-100 scale-[2]"
                      : "opacity-0 group-hover/accent:opacity-30 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: theme.primary }}
                >
                  <div
                    className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-primary bg-white transition-all ${
                      isResizingAccent
                        ? "scale-100 opacity-100"
                        : "scale-0 opacity-0 group-hover/accent:scale-100 group-hover/accent:opacity-100"
                    }`}
                  />
                </div>
              )}
            </div>
          )}

          <div
            className={`relative flex-1 flex flex-col justify-center min-w-0 z-10 ${
              isBackground ? "z-20" : ""
            }`}
          >
            <div
              className={cn(
                "relative min-w-0 max-w-full outline-none",
                fullWidth
                  ? "w-full max-w-[1600px] mx-auto px-16 md:px-24 py-20 md:py-32"
                  : "p-5 md:p-10"
              )}
            >
              <div className="flex flex-col gap-0 relative">
                {!readOnly && (
                  <InsertDropZone
                    slideId={slide.id}
                    insertIndex={0}
                    themePrimary={theme.primary}
                    isActive={dragActive}
                  />
                )}
                {(slide.rows || []).map((row, rowIndex) => (
                  <React.Fragment key={row.id}>
                    <ContentRow
                      row={row}
                      slideId={slide.id}
                      rowIndex={rowIndex}
                      totalRowsInSlide={slide.rows?.length || 0}
                      isDragging={dragActive}
                      enableDragHints={enableDragHints}
                      onUpdateBlock={(blockId, content) =>
                        onUpdateBlock(slide.id, blockId, content)
                      }
                      onDeleteRow={(rowId) => onDeleteRow(slide.id, rowId)}
                      onAddColumn={(rowId, afterBlockId) =>
                        onAddColumn(slide.id, rowId, afterBlockId)
                      }
                      onUpdateColumnWidths={(
                        rowId: string,
                        columnWidths: number[]
                      ) => onUpdateColumnWidths(slide.id, rowId, columnWidths)}
                      rowCount={slide.rows?.length || 0}
                      readOnly={readOnly}
                    />
                    {!readOnly && (
                      <InsertDropZone
                        slideId={slide.id}
                        insertIndex={rowIndex + 1}
                        themePrimary={theme.primary}
                        isActive={dragActive}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {!readOnly && isImagePickerOpen && (
        <Suspense fallback={null}>
          <ImagePickerModal
            isOpen={isImagePickerOpen}
            onClose={() => setIsImagePickerOpen(false)}
            onSelect={handleAccentImageSelect}
          />
        </Suspense>
      )}
    </>
  );
});
