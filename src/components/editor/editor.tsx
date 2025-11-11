"use client";

import React, { useRef, useState } from "react";
import Slide, {
  SlideElement,
  SlideElementUpdate,
} from "@/components/editor/slide";
import {
  EditorHeader,
  TextPreset,
  ShapePreset,
} from "@/components/editor/editor-header";

type TextPresetId = TextPreset["id"];
type ShapePresetId = ShapePreset["id"];

const DEFAULT_POSITIONS: Record<TextPresetId, { x: number; y: number }> = {
  heading: { x: 120, y: 100 },
  subheading: { x: 120, y: 180 },
  body: { x: 120, y: 260 },
};

const TEXT_PRESET_CONFIG: Record<
  TextPresetId,
  { width: number; height: number; fontSize: number; fontWeight: number }
> = {
  heading: { width: 420, height: 96, fontSize: 48, fontWeight: 600 },
  subheading: { width: 380, height: 72, fontSize: 28, fontWeight: 500 },
  body: { width: 420, height: 120, fontSize: 18, fontWeight: 400 },
};

const SHAPE_PRESET_CONFIG: Record<
  ShapePresetId,
  | {
      type: "rectangle";
      width: number;
      height: number;
      fill: string;
      borderRadius: number;
    }
  | { type: "circle"; width: number; height: number; fill: string }
  | {
      type: "arrow";
      width: number;
      height: number;
      stroke: string;
      strokeWidth: number;
    }
> = {
  rectangle: {
    type: "rectangle",
    width: 320,
    height: 180,
    fill: "#2563EB",
    borderRadius: 16,
  },
  circle: {
    type: "circle",
    width: 200,
    height: 200,
    fill: "#F97316",
  },
  arrow: {
    type: "arrow",
    width: 260,
    height: 80,
    stroke: "#14B8A6",
    strokeWidth: 8,
  },
};

const Editor = () => {
  const [elements, setElements] = useState<SlideElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    null
  );
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const idCounterRef = useRef(0);

  const createElementId = (prefix: string) => {
    idCounterRef.current += 1;
    return `${prefix}-${idCounterRef.current}`;
  };

  const handleAddText = (preset: TextPreset) => {
    const config = TEXT_PRESET_CONFIG[preset.id] ?? TEXT_PRESET_CONFIG.body;
    const coordinates = DEFAULT_POSITIONS[preset.id] ?? DEFAULT_POSITIONS.body;
    const id = createElementId("text");

    const newElement: SlideElement = {
      id,
      type: "text",
      text: preset.title,
      x: coordinates.x,
      y: coordinates.y,
      width: config.width,
      height: config.height,
      fontSize: config.fontSize,
      fontWeight: config.fontWeight,
      color: "#0f172a",
      align: "left",
    };

    setElements((prev) => [...prev, newElement]);
    setSelectedElementId(id);
    setEditingElementId(id);
  };

  const handleAddShape = (preset: ShapePreset) => {
    const config = SHAPE_PRESET_CONFIG[preset.id];
    if (!config) return;

    const id = createElementId(config.type);
    let newElement: SlideElement;

    switch (config.type) {
      case "rectangle":
        newElement = {
          id,
          type: "rectangle",
          x: 160,
          y: 220,
          width: config.width,
          height: config.height,
          fill: config.fill,
          borderRadius: config.borderRadius,
        };
        break;
      case "circle":
        newElement = {
          id,
          type: "circle",
          x: 200,
          y: 220,
          width: config.width,
          height: config.height,
          fill: config.fill,
        };
        break;
      case "arrow":
        newElement = {
          id,
          type: "arrow",
          x: 180,
          y: 240,
          width: config.width,
          height: config.height,
          stroke: config.stroke,
          strokeWidth: config.strokeWidth,
        };
        break;
    }

    setElements((prev) => [...prev, newElement]);
    setSelectedElementId(id);
    setEditingElementId(null);
  };

  const handleUpdateElement = (id: string, updates: SlideElementUpdate) => {
    setElements((prev) =>
      prev.map((element) =>
        element.id === id
          ? ({
              ...element,
              ...updates,
            } as SlideElement)
          : element
      )
    );
  };

  const handleSelectElement = (id: string | null) => {
    setSelectedElementId(id);
    if (id !== editingElementId) {
      setEditingElementId(null);
    }
  };

  const handleStartEditing = (id: string) => {
    setSelectedElementId(id);
    setEditingElementId(id);
  };

  const handleStopEditing = () => {
    setEditingElementId(null);
  };

  return (
    <div className="flex h-full flex-1 flex-col">
      <EditorHeader onAddText={handleAddText} onAddShape={handleAddShape} />
      <div className="flex flex-1 flex-col gap-4 p-6">
        <Slide
          elements={elements}
          selectedId={selectedElementId}
          editingId={editingElementId}
          onSelect={handleSelectElement}
          onUpdateElement={handleUpdateElement}
          onStartEditing={handleStartEditing}
          onStopEditing={handleStopEditing}
        />
      </div>
    </div>
  );
};

export default Editor;
