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

const SLIDE_DIMENSIONS = {
  width: 1280,
  height: 720,
};

const TEXT_PRESET_CONFIG: Record<
  TextPresetId,
  {
    width: number;
    height: number;
    fontSize: number;
    fontWeight: number;
    align: "left" | "center" | "right";
    lineHeight: number;
  }
> = {
  heading: {
    width: 960,
    height: 184,
    fontSize: 96,
    fontWeight: 600,
    align: "center",
    lineHeight: 1,
  },
  subheading: {
    width: 820,
    height: 140,
    fontSize: 48,
    fontWeight: 500,
    align: "center",
    lineHeight: 1.05,
  },
  body: {
    width: 720,
    height: 240,
    fontSize: 24,
    fontWeight: 400,
    align: "left",
    lineHeight: 1.4,
  },
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
    const originX = Math.max(
      40,
      Math.round((SLIDE_DIMENSIONS.width - config.width) / 2)
    );
    const originY =
      preset.id === "heading" ? 140 : preset.id === "subheading" ? 240 : 340;
    const id = createElementId("text");

    const newElement: SlideElement = {
      id,
      type: "text",
      text: preset.title,
      x: originX,
      y: originY,
      width: config.width,
      height: config.height,
      fontSize: config.fontSize,
      fontWeight: config.fontWeight,
      color: "#0f172a",
      align: config.align,
      lineHeight: config.lineHeight,
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
    const centerX = Math.round((SLIDE_DIMENSIONS.width - config.width) / 2);
    const centerY = Math.round((SLIDE_DIMENSIONS.height - config.height) / 2);

    switch (config.type) {
      case "rectangle":
        newElement = {
          id,
          type: "rectangle",
          x: centerX,
          y: centerY,
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
          x: centerX,
          y: centerY,
          width: config.width,
          height: config.height,
          fill: config.fill,
        };
        break;
      case "arrow":
        newElement = {
          id,
          type: "arrow",
          x: centerX,
          y: centerY,
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
