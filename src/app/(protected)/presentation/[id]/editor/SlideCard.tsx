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

  // Background style based on transparency
  const getCardBaseBackground = () => {
    if (theme.cardTransparency === "faded") {
      return `${theme.cardBackground}40`;
    }
    if (theme.cardTransparency === "frosted") {
      return `${theme.cardBackground}10`;
    }
    return theme.cardBackground;
  };

  // Generate CSS Box Shadow
  const getCardShadow = () => {
    if (fullWidth) return "none";
    const shadowType = theme.cardShadow || "none";
    const isDark = theme.themeType === "dark";
    
    switch (shadowType) {
      case "soft":
        return isDark 
          ? "0 4px 24px rgba(0, 0, 0, 0.4)" 
          : "0 4px 20px rgba(0, 0, 0, 0.06)";
      case "hard":
        return `6px 6px 0px ${isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.1)'}`;
      case "floating":
        return isDark
          ? "0 24px 48px rgba(0, 0, 0, 0.5)"
          : "0 20px 40px rgba(0, 0, 0, 0.12)";
      case "glow":
        return `0 0 25px ${theme.primary}40`;
      case "none":
      default:
        return "none";
    }
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor: getCardBaseBackground(),
    backdropFilter: theme.cardTransparency === "frosted" ? "blur(24px)" : "none",
    WebkitBackdropFilter: theme.cardTransparency === "frosted" ? "blur(24px)" : "none",
    boxShadow: getCardShadow(),
    fontFamily: getFontFamily(theme.fontFamily || "Inter"),
    borderRadius: fullWidth ? "0px" : `${theme.cardRoundness || 16}px`,
    borderWidth: fullWidth ? "0px" : "1px",
    borderStyle: (theme.cardBorderStyle as any) || "solid",
    borderColor: theme.cardBorderColor || `${theme.primary}15`,
    ...(fullWidth
      ? {
          width: "100%",
          minHeight: "100vh",
        }
      : {
          minWidth: `${SLIDE_MAX_WIDTH}px`,
          maxWidth: `${SLIDE_MAX_WIDTH}px`,
        }),
  };

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
      className={`group/slide relative transition-all duration-300 ease-out overflow-hidden ${
        fullWidth
          ? "w-full px-12 md:px-20 lg:px-32 py-16 md:py-24 lg:py-32 flex flex-col justify-center"
          : "px-8 py-8 mx-auto"
      }`}
      style={containerStyle}
      onMouseEnter={!readOnly ? () => setIsHovered(true) : undefined}
      onMouseLeave={!readOnly ? () => setIsHovered(false) : undefined}
    >
      {renderPattern()}
      {enableDragHints && !readOnly && (
        <DragStateBridge onDragChange={setIsDragging} />
      )}

      {/* Add Row at Top - Minimal design */}
      {!readOnly && (
        <button
          onClick={() => onAddRowAtTop(slide.id)}
          className={`absolute left-1/2 -translate-x-1/2 -top-3 z-10 transition-all duration-200 ${
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
          className={`absolute left-1/2 -translate-x-1/2 -bottom-3 z-10 transition-all duration-200 ${
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
