"use client";

import React from "react";
import {
  Heading1,
  Heading2,
  Pilcrow,
  LayoutTemplate,
  Type,
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
import { cn } from "@/lib/utils";

const featureCardPresets: FeatureCardPreset[] = [
  {
    id: "default",
    title: "AI Models",
    description: "Compare various AI models side-by-side.",
  },
];

const shapeItems: ShapePreset[] = [
  {
    id: "square-solid",
    title: "Square",
    category: "essential",
    preview: <SquarePreview className="h-8 w-8" />,
  },
  {
    id: "rounded-square-solid",
    title: "Rounded",
    category: "essential",
    preview: <SquarePreview rounded className="h-8 w-8" />,
  },
  {
    id: "circle-solid",
    title: "Circle",
    category: "essential",
    preview: <CirclePreview className="h-8 w-8" />,
  },
  {
    id: "triangle-solid",
    title: "Triangle",
    category: "essential",
    preview: <PolygonPreview points="50,8 94,92 6,92" className="h-10 w-10" />,
  },
  {
    id: "diamond-solid",
    title: "Diamond",
    category: "essential",
    preview: <PolygonPreview points="50,6 94,50 50,94 6,50" className="h-10 w-10" />,
  },
  {
    id: "star-solid",
    title: "Star",
    category: "essential",
    preview: (
      <PolygonPreview
        points="50,5 61,32 90,35 68,55 74,84 50,69 26,84 32,55 10,35 39,32"
        className="h-10 w-10"
      />
    ),
  },
  {
    id: "arrow",
    title: "Arrow",
    category: "lines",
    preview: <ArrowPreview className="h-6 w-10" />,
  },
  {
    id: "square-outline",
    title: "Square",
    category: "outlined",
    preview: <SquarePreview outline className="h-8 w-8" />,
  },
  {
    id: "rounded-square-outline",
    title: "Rounded",
    category: "outlined",
    preview: <SquarePreview rounded outline className="h-8 w-8" />,
  },
  {
    id: "circle-outline",
    title: "Circle",
    category: "outlined",
    preview: <CirclePreview outline className="h-8 w-8" />,
  },
  {
    id: "triangle-outline",
    title: "Triangle",
    category: "outlined",
    preview: <PolygonPreview points="50,8 94,92 6,92" outline className="h-10 w-10" />,
  },
  {
    id: "diamond-outline",
    title: "Diamond",
    category: "outlined",
    preview: <PolygonPreview points="50,6 94,50 50,94 6,50" outline className="h-10 w-10" />,
  },
];

type InsertPanelContentProps = {
  onAddText: (preset: TextPreset) => void;
  onAddShape?: (preset: ShapePreset) => void;
  onAddFeatureCard?: (preset: FeatureCardPreset) => void;
  onClose: () => void;
};

interface InsertItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
}

const InsertItem: React.FC<InsertItemProps> = ({
  icon,
  label,
  onClick,
  className,
}) => (
  <button
    onClick={onClick}
    className={cn(
      "group flex flex-col items-center justify-center gap-3 rounded-xl border border-border/40 bg-background/50 p-4 transition-all duration-200 hover:border-primary/20 hover:bg-accent hover:shadow-sm active:scale-95",
      className
    )}
  >
    <div className="text-foreground/70 transition-colors duration-200 group-hover:text-primary group-hover:scale-110">
      {icon}
    </div>
    <span className="text-xs font-medium text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
      {label}
    </span>
  </button>
);

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
    <div className="space-y-8 pb-8">
      {/* Text Options */}
      <div className="space-y-3">
        <h3 className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          Typography
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <InsertItem
            icon={<Heading1 className="h-6 w-6" />}
            label="Heading"
            onClick={() => handleAddText({ id: "heading", title: "Heading" })}
          />
          <InsertItem
            icon={<Heading2 className="h-6 w-6" />}
            label="Subhead"
            onClick={() =>
              handleAddText({ id: "subheading", title: "Subheading" })
            }
          />
          <InsertItem
            icon={<Pilcrow className="h-6 w-6" />}
            label="Body"
            onClick={() => handleAddText({ id: "body", title: "Body Text" })}
          />
        </div>
      </div>

      {/* Shapes */}
      <div className="space-y-3">
        <h3 className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          Shapes & Diagrams
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {shapeItems.map((item) => (
            <InsertItem
              key={item.id}
              icon={item.preview}
              label={item.title}
              onClick={() => handleAddShape(item)}
              className="aspect-square p-2"
            />
          ))}
        </div>
      </div>

      {/* Feature Cards */}
      <div className="space-y-3">
        <h3 className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          Components
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {featureCardPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleAddFeatureCard(preset)}
              className="group flex w-full items-center gap-4 rounded-xl border border-border/40 bg-background/50 p-4 text-left transition-all duration-200 hover:border-primary/20 hover:bg-accent hover:shadow-sm active:scale-[0.98]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                <LayoutTemplate className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {preset.title}
                </div>
                <div className="text-xs text-muted-foreground line-clamp-1">
                  {preset.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

