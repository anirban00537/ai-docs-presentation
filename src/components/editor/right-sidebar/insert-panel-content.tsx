"use client";

import React from "react";
import {
  Heading1,
  Heading2,
  Pilcrow,
  LayoutTemplate,
  ImageIcon,
  Quote,
  StickyNote,
} from "lucide-react";
import {
  ArrowPreview,
  CirclePreview,
  PolygonPreview,
  SquarePreview,
} from "@/components/editor/shape-previews";
import type {
  TextPreset,
  ShapePreset,
  FeatureCardPreset,
} from "@/components/editor/editor-toolbar";
import { Button } from "@/components/ui/button";

const featureCardPresets: FeatureCardPreset[] = [
  {
    id: "default",
    title: "Multiple AI models",
    description:
      "Supports various AI models beyond Google's Gemini, including open source alternatives like GPT-OSS.",
  },
];

const shapeItems: ShapePreset[] = [
  {
    id: "square-solid",
    title: "Square",
    category: "essential",
    preview: <SquarePreview />,
  },
  {
    id: "rounded-square-solid",
    title: "Rounded Square",
    category: "essential",
    preview: <SquarePreview rounded />,
  },
  {
    id: "circle-solid",
    title: "Circle",
    category: "essential",
    preview: <CirclePreview />,
  },
  {
    id: "triangle-solid",
    title: "Triangle",
    category: "essential",
    preview: <PolygonPreview points="50,8 94,92 6,92" />,
  },
  {
    id: "diamond-solid",
    title: "Diamond",
    category: "essential",
    preview: <PolygonPreview points="50,6 94,50 50,94 6,50" />,
  },
  {
    id: "star-solid",
    title: "Star",
    category: "essential",
    preview: (
      <PolygonPreview points="50,5 61,32 90,35 68,55 74,84 50,69 26,84 32,55 10,35 39,32" />
    ),
  },
  {
    id: "square-outline",
    title: "Square Outline",
    category: "outlined",
    preview: <SquarePreview outline />,
  },
  {
    id: "rounded-square-outline",
    title: "Rounded Outline",
    category: "outlined",
    preview: <SquarePreview rounded outline />,
  },
  {
    id: "circle-outline",
    title: "Circle Outline",
    category: "outlined",
    preview: <CirclePreview outline />,
  },
  {
    id: "triangle-outline",
    title: "Triangle Outline",
    category: "outlined",
    preview: <PolygonPreview points="50,8 94,92 6,92" outline />,
  },
  {
    id: "diamond-outline",
    title: "Diamond Outline",
    category: "outlined",
    preview: <PolygonPreview points="50,6 94,50 50,94 6,50" outline />,
  },
  {
    id: "star-outline",
    title: "Star Outline",
    category: "outlined",
    preview: (
      <PolygonPreview
        points="50,5 61,32 90,35 68,55 74,84 50,69 26,84 32,55 10,35 39,32"
        outline
      />
    ),
  },
  {
    id: "arrow",
    title: "Arrow",
    category: "lines",
    preview: <ArrowPreview />,
  },
];

type InsertPanelContentProps = {
  onAddText: (preset: TextPreset) => void;
  onAddShape?: (preset: ShapePreset) => void;
  onAddFeatureCard?: (preset: FeatureCardPreset) => void;
  onClose: () => void;
};

export const InsertPanelContent: React.FC<InsertPanelContentProps> = ({
  onAddText,
  onAddShape,
  onAddFeatureCard,
  onClose,
}) => {
  const handleAddText = (preset: TextPreset) => {
    onAddText(preset);
    onClose();
  };

  const handleAddShape = (preset: ShapePreset) => {
    onAddShape?.(preset);
    onClose();
  };

  const handleAddFeatureCard = (preset: FeatureCardPreset) => {
    onAddFeatureCard?.(preset);
    onClose();
  };

  return (
    <div className="space-y-6">
      {/* Text Options */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          Text
        </h3>
        <div className="space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start rounded-md py-1.5 text-xs hover:bg-primary/10 hover:text-primary"
            onClick={() => handleAddText({ id: "body", title: "Body Text" })}
          >
            <Pilcrow className="mr-2 h-3.5 w-3.5 opacity-70" />
            Paragraph
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start rounded-md py-1.5 text-xs hover:bg-primary/10 hover:text-primary"
            onClick={() => handleAddText({ id: "heading", title: "Heading" })}
          >
            <Heading1 className="mr-2 h-3.5 w-3.5 opacity-70" />
            Heading
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start rounded-md py-1.5 text-xs hover:bg-primary/10 hover:text-primary"
            onClick={() =>
              handleAddText({ id: "subheading", title: "Subheading" })
            }
          >
            <Heading2 className="mr-2 h-3.5 w-3.5 opacity-70" />
            Subheading
          </Button>
        </div>
      </div>

      {/* Shapes */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          Diagrams (Shapes)
        </h3>
        <div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
          {shapeItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className="w-full justify-start rounded-md py-1.5 text-xs hover:bg-primary/10 hover:text-primary"
              onClick={() => handleAddShape(item)}
            >
              <div className="flex items-center gap-2">
                <span className="h-5 w-5 flex items-center justify-center opacity-70">
                  {item.preview}
                </span>
                <span>{item.title}</span>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Feature Cards */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          Cards
        </h3>
        <div className="space-y-1">
          {featureCardPresets.map((preset) => (
            <Button
              key={preset.id}
              variant="ghost"
              className="w-full justify-start rounded-md py-1.5 text-xs hover:bg-primary/10 hover:text-primary"
              onClick={() => handleAddFeatureCard(preset)}
            >
              <LayoutTemplate className="mr-2 h-3.5 w-3.5 opacity-70" />
              {preset.title}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

