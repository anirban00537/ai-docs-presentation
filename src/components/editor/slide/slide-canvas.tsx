"use client";

import React, { useCallback, useEffect, useRef } from "react";
import ElementFrame from "./element-frame";
import { SlideProps, SlideInteractionLogger } from "./types";

const SLIDE_WIDTH = 1280;
const SLIDE_HEIGHT = 720;

const SlideCanvas: React.FC<SlideProps> = ({
  elements,
  selectedId,
  editingId,
  onSelect,
  onUpdateElement,
  onStartEditing,
  onStopEditing,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editingTextareaRef = useRef<HTMLTextAreaElement>(null!);

  useEffect(() => {
    if (editingId && editingTextareaRef.current) {
      editingTextareaRef.current.focus();
      editingTextareaRef.current.select();
    }
  }, [editingId]);

  const handleCanvasPointerDown = useCallback<
    React.PointerEventHandler<HTMLDivElement>
  >(
    (event) => {
      if (event.target === containerRef.current) {
        onSelect(null);
        onStopEditing();
      }
    },
    [onSelect, onStopEditing]
  );

  const logInteraction = useCallback<SlideInteractionLogger>(
    (action, detail) => {
      console.log(`[Slide] ${action}`, detail);
    },
    []
  );

  return (
    <div className="flex flex-1 items-center justify-center overflow-auto bg-slate-100/60 py-6">
      <div
        ref={containerRef}
        className="relative bg-white"
        style={{
          width: SLIDE_WIDTH,
          height: SLIDE_HEIGHT,
        }}
        onPointerDown={handleCanvasPointerDown}
      >
        {elements.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="rounded-full bg-white/80 px-4 py-2 text-sm text-muted-foreground shadow-sm">
              Use the toolbar to add content to this slide.
            </span>
          </div>
        )}

        {elements.map((element) => (
          <ElementFrame
            key={element.id}
            element={element}
            isSelected={selectedId === element.id}
            isEditing={editingId === element.id}
            onSelect={onSelect}
            onUpdateElement={onUpdateElement}
            onStartEditing={onStartEditing}
            onStopEditing={onStopEditing}
            editingTextareaRef={editingTextareaRef}
            logInteraction={logInteraction}
          />
        ))}
      </div>
    </div>
  );
};

export default SlideCanvas;
