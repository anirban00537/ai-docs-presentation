"use client";

import React from "react";
import {
  Heading1,
  Heading2,
  Pilcrow,
  LayoutTemplate,
  Type,
  Star,
  Zap,
  Heart,
  Rocket,
  Tag,
  List,
  ListOrdered,
  Quote,
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
  IconCardPreset,
  LabelCardPreset,
  ListCardPreset,
  QuotePreset,
} from "@/components/editor/types";
import { cn } from "@/lib/utils";

const featureCardPresets: FeatureCardPreset[] = [
  {
    id: "default",
    title: "Number Card",
    description: "Card with number, title and description.",
  },
];

const iconCardPresets: IconCardPreset[] = [
  {
    id: "default",
    icon: "Star",
    title: "Feature Title",
    description: "Feature description goes here.",
  },
];

const labelCardPresets: LabelCardPreset[] = [
  {
    id: "default",
    label: "Key insight",
    title: "Label Card",
    description: "Card with a colored label badge.",
  },
];

const listCardPresets: ListCardPreset[] = [
  {
    id: "bullet",
    title: "Features",
    items: ["Feature one", "Feature two", "Feature three"],
    listType: "bullet",
  },
  {
    id: "numbered",
    items: ["First step", "Second step", "Third step"],
    listType: "numbered",
  },
];

const quotePresets: QuotePreset[] = [
  {
    id: "minimal",
    quote: "The only way to do great work is to love what you do.",
    attribution: "Steve Jobs",
    icon: "Quote",
    style: "minimal",
  },
  {
    id: "bold",
    quote: "Innovation distinguishes between a leader and a follower.",
    attribution: "Steve Jobs",
    icon: "Sparkles",
    style: "bold",
  },
  {
    id: "bordered",
    quote: "Design is not just what it looks like and feels like. Design is how it works.",
    attribution: "Steve Jobs",
    style: "bordered",
  },
];

const shapeItems: ShapePreset[] = [
  {
    id: "square-solid",
    title: "Square",
    category: "essential",
    preview: <SquarePreview className="h-6 w-6" />,
  },
  {
    id: "rounded-square-solid",
    title: "Rounded",
    category: "essential",
    preview: <SquarePreview rounded className="h-6 w-6" />,
  },
  {
    id: "circle-solid",
    title: "Circle",
    category: "essential",
    preview: <CirclePreview className="h-6 w-6" />,
  },
  {
    id: "triangle-solid",
    title: "Triangle",
    category: "essential",
    preview: <PolygonPreview points="50,8 94,92 6,92" className="h-8 w-8" />,
  },
  {
    id: "diamond-solid",
    title: "Diamond",
    category: "essential",
    preview: (
      <PolygonPreview points="50,6 94,50 50,94 6,50" className="h-8 w-8" />
    ),
  },
  {
    id: "star-solid",
    title: "Star",
    category: "essential",
    preview: (
      <PolygonPreview
        points="50,5 61,32 90,35 68,55 74,84 50,69 26,84 32,55 10,35 39,32"
        className="h-8 w-8"
      />
    ),
  },
  {
    id: "arrow",
    title: "Arrow",
    category: "lines",
    preview: <ArrowPreview className="h-4 w-8" />,
  },
  {
    id: "square-outline",
    title: "Square",
    category: "outlined",
    preview: <SquarePreview outline className="h-6 w-6" />,
  },
  {
    id: "rounded-square-outline",
    title: "Rounded",
    category: "outlined",
    preview: <SquarePreview rounded outline className="h-6 w-6" />,
  },
  {
    id: "circle-outline",
    title: "Circle",
    category: "outlined",
    preview: <CirclePreview outline className="h-6 w-6" />,
  },
  {
    id: "triangle-outline",
    title: "Triangle",
    category: "outlined",
    preview: (
      <PolygonPreview points="50,8 94,92 6,92" outline className="h-8 w-8" />
    ),
  },
  {
    id: "diamond-outline",
    title: "Diamond",
    category: "outlined",
    preview: (
      <PolygonPreview
        points="50,6 94,50 50,94 6,50"
        outline
        className="h-8 w-8"
      />
    ),
  },
];

type InsertPanelContentProps = {
  onAddText: (preset: TextPreset) => void;
  onAddShape?: (preset: ShapePreset) => void;
  onAddFeatureCard?: (preset: FeatureCardPreset) => void;
  onAddIconCard?: (preset: IconCardPreset) => void;
  onAddLabelCard?: (preset: LabelCardPreset) => void;
  onAddListCard?: (preset: ListCardPreset) => void;
  onAddQuote?: (preset: QuotePreset) => void;
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
      "group flex flex-col items-center justify-center gap-2 rounded-lg border border-border/40 bg-background/50 p-2.5 transition-all duration-200 hover:border-primary/20 hover:bg-accent hover:shadow-sm active:scale-95",
      className
    )}
  >
    <div className="text-foreground/70 transition-colors duration-200 group-hover:text-primary group-hover:scale-110">
      {icon}
    </div>
    <span className="text-[10px] font-medium text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
      {label}
    </span>
  </button>
);

export const InsertPanelContent: React.FC<InsertPanelContentProps> = ({
  onAddText,
  onAddShape,
  onAddFeatureCard,
  onAddIconCard,
  onAddLabelCard,
  onAddListCard,
  onAddQuote,
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

  const handleAddIconCard = (preset: IconCardPreset) => {
    onAddIconCard?.(preset);
    onClose();
  };

  const handleAddLabelCard = (preset: LabelCardPreset) => {
    onAddLabelCard?.(preset);
    onClose();
  };

  const handleAddListCard = (preset: ListCardPreset) => {
    onAddListCard?.(preset);
    onClose();
  };

  const handleAddQuote = (preset: QuotePreset) => {
    onAddQuote?.(preset);
    onClose();
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Text Options */}
      <div className="space-y-2">
        <h3 className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          Typography
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <InsertItem
            icon={<Heading1 className="h-5 w-5" />}
            label="Heading"
            onClick={() => handleAddText({ id: "heading", title: "Heading" })}
          />
          <InsertItem
            icon={<Heading2 className="h-5 w-5" />}
            label="Subhead"
            onClick={() =>
              handleAddText({ id: "subheading", title: "Subheading" })
            }
          />
          <InsertItem
            icon={<Pilcrow className="h-5 w-5" />}
            label="Body"
            onClick={() => handleAddText({ id: "body", title: "Body Text" })}
          />
        </div>
      </div>

      {/* Shapes */}
      <div className="space-y-2">
        <h3 className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          Shapes & Diagrams
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {shapeItems.map((item) => (
            <InsertItem
              key={item.id}
              icon={item.preview}
              label={item.title}
              onClick={() => handleAddShape(item)}
              className="aspect-square"
            />
          ))}
        </div>
      </div>

      {/* Feature Cards */}
      <div className="space-y-2">
        <h3 className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          Number Cards
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {featureCardPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleAddFeatureCard(preset)}
              className="group flex w-full items-center gap-3 rounded-lg border border-border/40 bg-background/50 p-3 text-left transition-all duration-200 hover:border-primary/20 hover:bg-accent hover:shadow-sm active:scale-[0.98]"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                <LayoutTemplate className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-0.5">
                <div className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                  {preset.title}
                </div>
                <div className="text-[10px] text-muted-foreground line-clamp-1">
                  {preset.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Icon Cards */}
      <div className="space-y-2">
        <h3 className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          Icon Cards
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {iconCardPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleAddIconCard(preset)}
              className="group flex w-full items-center gap-3 rounded-lg border border-border/40 bg-background/50 p-3 text-left transition-all duration-200 hover:border-primary/20 hover:bg-accent hover:shadow-sm active:scale-[0.98]"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                <Star className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-0.5">
                <div className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                  Icon Card
                </div>
                <div className="text-[10px] text-muted-foreground line-clamp-1">
                  Card with icon, title and description
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Label Cards */}
      <div className="space-y-2">
        <h3 className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          Label Cards
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {labelCardPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleAddLabelCard(preset)}
              className="group flex w-full items-center gap-3 rounded-lg border border-border/40 bg-background/50 p-3 text-left transition-all duration-200 hover:border-primary/20 hover:bg-accent hover:shadow-sm active:scale-[0.98]"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                <Tag className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-0.5">
                <div className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                  {preset.title}
                </div>
                <div className="text-[10px] text-muted-foreground line-clamp-1">
                  {preset.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* List Cards */}
      <div className="space-y-2">
        <h3 className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          Lists
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {listCardPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleAddListCard(preset)}
              className="group flex w-full items-center gap-3 rounded-lg border border-border/40 bg-background/50 p-3 text-left transition-all duration-200 hover:border-primary/20 hover:bg-accent hover:shadow-sm active:scale-[0.98]"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                {preset.listType === "numbered" ? (
                  <ListOrdered className="h-4 w-4" />
                ) : (
                  <List className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1 space-y-0.5">
                <div className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                  {preset.title || `${preset.listType === "numbered" ? "Numbered" : "Bullet"} List`}
                </div>
                <div className="text-[10px] text-muted-foreground line-clamp-1">
                  {preset.items.length} items
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quote Widgets */}
      <div className="space-y-2">
        <h3 className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          Quotes
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {quotePresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleAddQuote(preset)}
              className="group flex w-full items-center gap-3 rounded-lg border border-border/40 bg-background/50 p-3 text-left transition-all duration-200 hover:border-primary/20 hover:bg-accent hover:shadow-sm active:scale-[0.98]"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                <Quote className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-0.5">
                <div className="text-xs font-medium text-foreground group-hover:text-primary transition-colors capitalize">
                  {preset.style || "Minimal"} Quote
                </div>
                <div className="text-[10px] text-muted-foreground line-clamp-1">
                  {preset.quote.substring(0, 40)}...
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
