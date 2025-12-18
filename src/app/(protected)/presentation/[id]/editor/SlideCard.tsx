import React, { useState } from "react";
import { useDroppable, useDndMonitor } from "@dnd-kit/core";
import { DroppableRow } from "./DroppableRow";
import type { Slide } from "@/store/slices/slidesSlice";
import { useAppSelector } from "@/store/hooks";
import {
  selectTheme,
  DEFAULT_THEME,
  type Theme,
} from "@/store/slices/slidesSlice";
import { getFontFamily } from "@/lib/fonts";
import { SLIDE_MAX_WIDTH } from "@/lib/constants";
import { IconPlus } from "@tabler/icons-react";
import * as Patterns from "./patterns";

const DragStateBridge: React.FC<{
  onDragChange: (dragging: boolean) => void;
}> = ({ onDragChange }) => {
  useDndMonitor({
    onDragStart: () => onDragChange(true),
    onDragEnd: () => onDragChange(false),
    onDragCancel: () => onDragChange(false),
  });
  return null;
};

const InsertDropZone: React.FC<{
  slideId: string;
  insertIndex: number;
  themePrimary: string;
  isActive: boolean;
}> = ({ slideId, insertIndex, themePrimary, isActive }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `row-insert-${slideId}-${insertIndex}`,
    data: {
      type: "row-insert",
      slideId,
      insertIndex,
    },
  });

  // Only render the drop zone during active dragging
  if (!isActive) return null;

  return (
    <div
      ref={setNodeRef}
      className="relative h-6 flex items-center justify-center"
    >
      {/* Only show the indicator line when hovering over this specific zone */}
      {isOver && (
        <div
          className="absolute inset-x-4 h-0.5 flex items-center"
          style={{ backgroundColor: themePrimary }}
        >
          {/* Left dot */}
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: themePrimary }}
          />
          {/* Right dot */}
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: themePrimary }}
          />
        </div>
      )}
    </div>
  );
};

interface SlideCardProps {
  slide: Slide;
  onUpdateBlock: (slideId: string, blockId: string, content: any) => void;
  onDeleteRow: (slideId: string, rowId: string) => void;
  onAddColumn: (slideId: string, rowId: string, afterBlockId: string) => void;
  onAddRowAtTop: (slideId: string) => void;
  onAddRowAtBottom: (slideId: string) => void;
  onUpdateColumnWidths: (
    slideId: string,
    rowId: string,
    columnWidths: number[]
  ) => void;
  enableDragHints?: boolean;
  readOnly?: boolean;
  /** When true, slide takes full width without max-width constraints (for presentation mode) */
  fullWidth?: boolean;
  /** Optional theme prop. If not provided, falls back to Redux store theme */
  theme?: Theme;
}

export const SlideCard: React.FC<SlideCardProps> = ({
  slide,
  onUpdateBlock,
  onDeleteRow,
  onAddColumn,
  onAddRowAtTop,
  onAddRowAtBottom,
  onUpdateColumnWidths,
  enableDragHints = true,
  readOnly = false,
  fullWidth = false,
  theme: themeProp,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const reduxTheme = useAppSelector(selectTheme);
  const theme = themeProp || reduxTheme || DEFAULT_THEME;

  const dragActive = enableDragHints ? isDragging : false;

  const getCardStyle = (): React.CSSProperties => {
    const isDark = theme.themeType === "dark";
    const primaryColor = theme.primary;

    const baseStyle: React.CSSProperties = {
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      backgroundColor: theme.cardBackground,
      fontFamily: getFontFamily(theme.fontFamily || "Inter"),
      ...(fullWidth
        ? { width: "100%", minHeight: "100vh" }
        : { minWidth: `${SLIDE_MAX_WIDTH}px`, maxWidth: `${SLIDE_MAX_WIDTH}px` }),
    };

    if (fullWidth) {
      return { ...baseStyle, borderRadius: "0px", boxShadow: "none", border: "none" };
    }

    // Use granular properties from theme with fallbacks
    const borderRadius = theme.cardBorderRadius || "12px";
    const boxShadow = theme.cardBoxShadow || (isDark ? "0 4px 20px rgba(0, 0, 0, 0.4)" : "0 4px 12px rgba(0, 0, 0, 0.08)");
    const borderWidth = theme.cardBorderWidth || "1px";
    const borderStyle = theme.cardBorderStyle || "solid";
    const borderColor = theme.cardBorderColor || `${primaryColor}15`;
    const backdropBlur = theme.cardBackdropBlur || "0px";
    const opacity = theme.cardOpacity !== undefined ? theme.cardOpacity : 1;

    return {
      ...baseStyle,
      backgroundColor: opacity < 1 ? `rgba(${isDark ? '255, 255, 255' : '255, 255, 255'}, ${opacity})` : theme.cardBackground,
      borderRadius,
      boxShadow,
      border: `${borderWidth} ${borderStyle} ${borderColor}`,
      backdropFilter: backdropBlur !== "0px" ? `blur(${backdropBlur})` : "none",
      WebkitBackdropFilter: backdropBlur !== "0px" ? `blur(${backdropBlur})` : "none",
    };
  };

  const containerStyle = getCardStyle();
  const cardRadius = containerStyle.borderRadius;

  const renderPattern = () => {
    const pattern = theme.cardDesignPattern;
    if (!pattern || pattern === "none") return null;

    const secondaryColors = theme.secondaryColors || [];
    const color1 = secondaryColors[0] || theme.primary;
    const color2 = secondaryColors[1] || theme.primary;

    switch (pattern) {
      case "dots":
        return <Patterns.Dots color={theme.primary} id={slide.id} />;
      case "grid":
        return <Patterns.Grid color={theme.primary} id={slide.id} />;
      case "mesh":
        return <Patterns.Mesh primary={theme.primary} color1={color1} color2={color2} />;
      case "waves":
        return <Patterns.Waves color={theme.primary} />;
      case "glass":
        return <Patterns.Glass color={theme.primary} />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`group/slide relative transition-all duration-300 ease-out z-0 hover:z-20 ${
        fullWidth
          ? "w-full px-12 md:px-20 lg:px-32 py-16 md:py-24 lg:py-32 flex flex-col justify-center"
          : "px-8 py-8 mx-auto"
      }`}
      style={containerStyle}
      onMouseEnter={!readOnly ? () => setIsHovered(true) : undefined}
      onMouseLeave={!readOnly ? () => setIsHovered(false) : undefined}
    >
      {/* Pattern clipping layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ borderRadius: cardRadius }}>
        {renderPattern()}
      </div>
      {enableDragHints && !readOnly && (
        <DragStateBridge onDragChange={setIsDragging} />
      )}

      {/* Add Row at Top - Minimal design */}
      {!readOnly && (
        <button
          onClick={() => onAddRowAtTop(slide.id)}
          className={`absolute left-1/2 -translate-x-1/2 -top-3 z-30 transition-all duration-200 ${
            isHovered
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-1 pointer-events-none"
          }`}
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-sm"
            style={{
              backgroundColor: `${theme.primary}15`,
              color: theme.primary,
            }}
          >
            <IconPlus size={14} stroke={2.5} />
          </div>
        </button>
      )}

      {/* Slide Content */}
      <div className="flex flex-col gap-0 relative z-10">
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
            <DroppableRow
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
              onUpdateColumnWidths={(rowId, columnWidths) =>
                onUpdateColumnWidths(slide.id, rowId, columnWidths)
              }
              rowCount={slide.rows?.length || 0}
              readOnly={readOnly}
              theme={theme}
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

      {/* Add Row at Bottom - Minimal design */}
      {!readOnly && (
        <button
          onClick={() => onAddRowAtBottom(slide.id)}
          className={`absolute left-1/2 -translate-x-1/2 -bottom-3 z-30 transition-all duration-200 ${
            isHovered
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-1 pointer-events-none"
          }`}
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-sm"
            style={{
              backgroundColor: `${theme.primary}15`,
              color: theme.primary,
            }}
          >
            <IconPlus size={14} stroke={2.5} />
          </div>
        </button>
      )}
    </div>
  );
};
