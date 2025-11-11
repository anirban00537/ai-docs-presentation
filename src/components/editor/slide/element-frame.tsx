"use client";

import React, { useCallback } from "react";
import {
  Rnd,
  type RndDragCallback,
  type RndResizeCallback,
  type RndResizeStartCallback,
} from "react-rnd";
import { cn } from "@/lib/utils";
import ElementContent from "./element-content";
import {
  RectangleElement,
  SlideElement,
  SlideElementUpdate,
  SlideInteractionLogger,
} from "./types";

const handleStyle = () => ({
  width: "10px",
  height: "10px",
  borderRadius: "2px",
  background: "#2563eb",
  border: "1px solid #ffffff",
});

const resizeHandleStyles = {
  bottom: { height: "8px", background: "transparent" },
  bottomLeft: handleStyle(),
  bottomRight: handleStyle(),
  left: { width: "8px", background: "transparent" },
  right: { width: "8px", background: "transparent" },
  top: { height: "8px", background: "transparent" },
  topLeft: handleStyle(),
  topRight: handleStyle(),
} as const;

type ElementFrameProps = {
  element: SlideElement;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: (id: string | null) => void;
  onUpdateElement: (id: string, updates: SlideElementUpdate) => void;
  onStartEditing: (id: string) => void;
  onStopEditing: () => void;
  editingTextareaRef: React.RefObject<HTMLTextAreaElement>;
  logInteraction: SlideInteractionLogger;
};

const ElementFrame: React.FC<ElementFrameProps> = ({
  element,
  isSelected,
  isEditing,
  onSelect,
  onUpdateElement,
  onStartEditing,
  onStopEditing,
  editingTextareaRef,
  logInteraction,
}) => {
  const handleSelect: React.PointerEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
    if (!isSelected) {
      onSelect(element.id);
    }
  };

  const handleDragStart = useCallback<RndDragCallback>(
    (_event, data) => {
      logInteraction("drag:start", {
        id: element.id,
        x: data.x,
        y: data.y,
        width: element.width,
        height: element.height,
      });
    },
    [element, logInteraction]
  );

  const handleDrag = useCallback<RndDragCallback>(
    (_event, data) => {
      logInteraction("drag:move", {
        id: element.id,
        x: data.x,
        y: data.y,
        width: element.width,
        height: element.height,
      });
    },
    [element, logInteraction]
  );

  const handleDragStop = useCallback<RndDragCallback>(
    (_event, data) => {
      logInteraction("drag:stop", {
        id: element.id,
        x: data.x,
        y: data.y,
        width: element.width,
        height: element.height,
      });
      onUpdateElement(element.id, { x: data.x, y: data.y });
    },
    [element, logInteraction, onUpdateElement]
  );

  const handleResizeStart = useCallback<RndResizeStartCallback>(
    (_event, _dir, _ref) => {
      logInteraction("resize:start", {
        id: element.id,
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
      });
    },
    [element, logInteraction]
  );

  const handleResize = useCallback<RndResizeCallback>(
    (_event, _dir, ref, _delta, position) => {
      const width = parseFloat(ref.style.width);
      const height = parseFloat(ref.style.height);
      logInteraction("resize:move", {
        id: element.id,
        x: position.x,
        y: position.y,
        width,
        height,
      });
    },
    [element, logInteraction]
  );

  const handleResizeStop = useCallback<RndResizeCallback>(
    (_event, _dir, ref, _delta, position) => {
      const width = parseFloat(ref.style.width);
      const height = parseFloat(ref.style.height);
      logInteraction("resize:stop", {
        id: element.id,
        x: position.x,
        y: position.y,
        width,
        height,
      });
      onUpdateElement(element.id, {
        width,
        height,
        x: position.x,
        y: position.y,
      });
    },
    [element, logInteraction, onUpdateElement]
  );

  return (
    <Rnd
      bounds="parent"
      size={{ width: element.width, height: element.height }}
      position={{ x: element.x, y: element.y }}
      enableUserSelectHack={false}
      data-element-type={element.type}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragStop={handleDragStop}
      onResizeStart={handleResizeStart}
      onResize={handleResize}
      onResizeStop={handleResizeStop}
      enableResizing={isSelected && !isEditing}
      disableDragging={isEditing}
      dragHandleClassName="canvas-element__content"
      className={cn(
        "canvas-element group absolute flex select-none border border-transparent shadow-sm",
        isSelected && !isEditing
          ? "border-blue-500/70 shadow-[0_0_0_1px_rgba(37,99,235,0.6)]"
          : "border-transparent"
      )}
      style={{
        zIndex: isSelected ? 20 : 10,
        borderRadius:
          element.type === "circle"
            ? "9999px"
            : element.type === "rectangle"
            ? (element as RectangleElement).borderRadius
            : undefined,
      }}
      resizeHandleStyles={
        isSelected && !isEditing ? resizeHandleStyles : undefined
      }
      onPointerDown={handleSelect}
    >
      <div
        className={cn(
          "canvas-element__content relative flex h-full w-full items-stretch justify-stretch rounded",
          isEditing ? "cursor-text" : "cursor-move"
        )}
      >
        <ElementContent
          element={element}
          isEditing={isEditing}
          editingTextareaRef={editingTextareaRef}
          onStartEditing={onStartEditing}
          onStopEditing={onStopEditing}
          onUpdateElement={onUpdateElement}
        />
      </div>
    </Rnd>
  );
};

export default ElementFrame;
