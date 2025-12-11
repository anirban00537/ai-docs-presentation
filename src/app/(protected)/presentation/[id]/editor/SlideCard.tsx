import React, { useState } from "react";
import { useDroppable, useDndMonitor } from "@dnd-kit/core";
import { DroppableRow } from "./DroppableRow";
import type { Slide } from "@/store/slices/slidesSlice";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/slidesSlice";
import { getFontFamily } from "@/lib/fonts";

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

  return (
    <div className="relative -my-1">
      <div
        ref={setNodeRef}
        className={`flex items-center justify-center h-8 rounded-lg border border-dashed transition-all duration-150 bg-white/60 backdrop-blur-sm ${
          isOver || isActive ? "opacity-100 shadow-sm" : "opacity-0"
        }`}
        style={{
          borderColor: `${themePrimary}60`,
          boxShadow: isOver ? `0 6px 18px ${themePrimary}33` : "none",
        }}
      >
        <div
          className="flex items-center gap-2 text-xs font-medium px-2 py-1 rounded-full"
          style={{
            color: themePrimary,
            backgroundColor: isOver ? `${themePrimary}10` : "transparent",
            border: `1px solid ${themePrimary}30`,
          }}
        >
          <span
            className="inline-block h-[6px] w-10 rounded-full"
            style={{ backgroundColor: themePrimary }}
          />
          Drop to add row here
        </div>
      </div>
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
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;

  const dragActive = enableDragHints ? isDragging : false;

  return (
    <div
      className="group/slide relative rounded-3xl shadow-xl px-6 py-5 transition-all duration-200 ease-out hover:-translate-y-1"
      style={{
        backgroundColor: theme.cardBackground,
        border: `1px solid ${theme.primary}1f`,
        boxShadow: `0 18px 48px rgba(0,0,0,0.08), 0 6px 18px rgba(0,0,0,0.04)`,
        backdropFilter: "blur(8px)",
        transition:
          "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
        fontFamily: getFontFamily(theme.fontFamily || "Inter"),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {enableDragHints && <DragStateBridge onDragChange={setIsDragging} />}
      {/* Add Row at Top Button */}
      <button
        onClick={() => onAddRowAtTop(slide.id)}
        className={`absolute left-1/2 -translate-x-1/2 -top-4 z-10 px-3 py-1.5 text-white text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 shadow-md ${
          isHovered
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
        style={{
          backgroundColor: theme.primary,
          border: `1px solid ${theme.primary}30`,
          boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "0.9";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = isHovered ? "1" : "0";
        }}
        title="Add row at top"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="6" y1="2" x2="6" y2="10" />
          <line x1="2" y1="6" x2="10" y2="6" />
        </svg>
        <span>Add Row</span>
      </button>

      {/* Slide Content */}
      <div className="flex flex-col gap-2">
        <InsertDropZone
          slideId={slide.id}
          insertIndex={0}
          themePrimary={theme.primary}
          isActive={dragActive}
        />
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
            />
            <InsertDropZone
              slideId={slide.id}
              insertIndex={rowIndex + 1}
              themePrimary={theme.primary}
              isActive={dragActive}
            />
          </React.Fragment>
        ))}
      </div>

      {/* Add Row at Bottom Button */}
      <button
        onClick={() => onAddRowAtBottom(slide.id)}
        className={`absolute left-1/2 -translate-x-1/2 -bottom-4 z-10 px-3 py-1.5 text-white text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 shadow-md ${
          isHovered
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2 pointer-events-none"
        }`}
        style={{
          backgroundColor: theme.primary,
          border: `1px solid ${theme.primary}30`,
          boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "0.9";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = isHovered ? "1" : "0";
        }}
        title="Add row at bottom"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="6" y1="2" x2="6" y2="10" />
          <line x1="2" y1="6" x2="10" y2="6" />
        </svg>
        <span>Add Row</span>
      </button>
    </div>
  );
};
