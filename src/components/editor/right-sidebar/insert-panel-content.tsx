"use client";

import React from "react";
import {
  Heading1,
  Heading2,
  Pilcrow,
  LayoutTemplate,
  Star,
  Tag,
  List,
  ListOrdered,
  Quote,
  Image as ImageIcon,
  PanelsLeftRight,
} from "lucide-react";
import type {
  TextPreset,
  FeatureCardPreset,
  IconCardPreset,
  ImageCardPreset,
  LabelCardPreset,
  ListCardPreset,
  QuotePreset,
  ComparisonCardPreset,
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

const imageCardPresets: ImageCardPreset[] = [
  {
    id: "hero",
    title: "Hero Image",
    description: "Large image on top with content below.",
    imageStyle: "hero",
  },
  {
    id: "left",
    title: "Left Image",
    description: "Image on the left, content on the right.",
    imageStyle: "left",
  },
  {
    id: "right",
    title: "Right Image",
    description: "Image on the right, content on the left.",
    imageStyle: "right",
  },
  {
    id: "bottom",
    title: "Bottom Image",
    description: "Image on the bottom, content on top.",
    imageStyle: "bottom",
  },
  {
    id: "background",
    title: "Background",
    description: "Text overlays directly on the background.",
    imageStyle: "background",
  },
  {
    id: "background-glass",
    title: "Glass Background",
    description: "Background image with glassmorphism panel.",
    imageStyle: "backgroundGlass",
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
    id: "default",
    quote: "The only way to do great work is to love what you do.",
    attribution: "Steve Jobs",
    style: "minimal",
  },
];

const comparisonCardPresets: ComparisonCardPreset[] = [
  {
    id: "plans",
    leftTitle: "Growth Plan",
    rightTitle: "Competitor",
    leftItems: ["Unlimited projects", "Priority support", "Advanced reports"],
    rightItems: ["Limited projects", "Email support", "Basic reports"],
    leftAccentColor: "#2563eb",
    rightAccentColor: "#f97316",
  },
  {
    id: "features",
    leftTitle: "Plan A",
    rightTitle: "Plan B",
    leftItems: ["AI-assisted decks", "Shared libraries", "Version history"],
    rightItems: ["Manual updates", "Local files", "Single version"],
    leftAccentColor: "#14b8a6",
    rightAccentColor: "#ec4899",
  },
];

type InsertPanelContentProps = {
  onAddText: (preset: TextPreset) => void;
  onAddFeatureCard?: (preset: FeatureCardPreset) => void;
  onAddIconCard?: (preset: IconCardPreset) => void;
  onAddImageCard?: (preset: ImageCardPreset) => void;
  onAddLabelCard?: (preset: LabelCardPreset) => void;
  onAddListCard?: (preset: ListCardPreset) => void;
  onAddQuote?: (preset: QuotePreset) => void;
  onAddComparisonCard?: (preset: ComparisonCardPreset) => void;
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
      "group flex flex-col items-center justify-center gap-2.5 rounded-xl border border-border/50 bg-background/60 dark:bg-background/40 p-3 transition-all duration-200 hover:border-primary/40 hover:bg-accent/80 hover:shadow-md active:scale-[0.96]",
      className
    )}
  >
    <div className="text-foreground/70 transition-all duration-200 group-hover:text-primary group-hover:scale-110">
      {icon}
    </div>
    <span className="text-[10px] font-semibold text-muted-foreground transition-colors duration-200 group-hover:text-foreground tracking-tight">
      {label}
    </span>
  </button>
);

export const InsertPanelContent: React.FC<InsertPanelContentProps> = ({
  onAddText,
  onAddFeatureCard,
  onAddIconCard,
  onAddImageCard,
  onAddLabelCard,
  onAddListCard,
  onAddQuote,
  onAddComparisonCard,
  onClose,
}) => {
  const handleAddText = (preset: TextPreset) => {
    onAddText(preset);
  };

  const handleAddFeatureCard = (preset: FeatureCardPreset) => {
    onAddFeatureCard?.(preset);
  };

  const handleAddIconCard = (preset: IconCardPreset) => {
    onAddIconCard?.(preset);
  };

  const handleAddLabelCard = (preset: LabelCardPreset) => {
    onAddLabelCard?.(preset);
  };

  const handleAddImageCard = (preset: ImageCardPreset) => {
    onAddImageCard?.(preset);
  };

  const handleAddListCard = (preset: ListCardPreset) => {
    onAddListCard?.(preset);
  };

  const handleAddQuote = (preset: QuotePreset) => {
    onAddQuote?.(preset);
  };

  const handleAddComparisonCard = (preset: ComparisonCardPreset) => {
    onAddComparisonCard?.(preset);
  };

  // Combine all card presets into a single array for the grid
  const allCards = [
    ...featureCardPresets.map((preset) => ({
      type: "feature" as const,
      preset,
      icon: <LayoutTemplate className="h-4 w-4" />,
      title: "Number Card",
      description: preset.description,
      onClick: () => handleAddFeatureCard(preset),
    })),
    ...iconCardPresets.map((preset) => ({
      type: "icon" as const,
      preset,
      icon: <Star className="h-4 w-4" />,
      title: "Icon Card",
      description: "Card with icon, title and description",
      onClick: () => handleAddIconCard(preset),
    })),
    ...imageCardPresets.map((preset) => ({
      type: "image" as const,
      preset,
      icon: <ImageIcon className="h-4 w-4" />,
      title: preset.title, // Presets now have specific titles like "Hero Image", "Left Image"
      description: preset.description,
      onClick: () => handleAddImageCard(preset),
    })),
    ...labelCardPresets.map((preset) => ({
      type: "label" as const,
      preset,
      icon: <Tag className="h-4 w-4" />,
      title: "Label Card",
      description: preset.description,
      onClick: () => handleAddLabelCard(preset),
    })),
    ...listCardPresets.map((preset) => ({
      type: "list" as const,
      preset,
      icon:
        preset.listType === "numbered" ? (
          <ListOrdered className="h-4 w-4" />
        ) : (
          <List className="h-4 w-4" />
        ),
      title: preset.listType === "numbered" ? "Numbered List" : "Bullet List",
      description: `${preset.items.length} items`,
      onClick: () => handleAddListCard(preset),
    })),
    ...quotePresets.map((preset) => ({
      type: "quote" as const,
      preset,
      icon: <Quote className="h-4 w-4" />,
      title: "Quote Card",
      description: "Quote with attribution",
      onClick: () => handleAddQuote(preset),
    })),
    ...comparisonCardPresets.map((preset) => ({
      type: "comparison" as const,
      preset,
      icon: <PanelsLeftRight className="h-4 w-4" />,
      title: "Comparison Card",
      description: "Plan A vs Plan B",
      onClick: () => handleAddComparisonCard(preset),
    })),
  ];

  return (
    <div className="space-y-7 pb-6">
      {/* Text Options */}
      <div className="space-y-3">
        <h3 className="px-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
          Typography
        </h3>
        <div className="grid grid-cols-3 gap-2.5">
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

      {/* All Cards */}
      <div className="space-y-3">
        <h3 className="px-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
          Cards
        </h3>
        <div className="grid grid-cols-2 gap-2.5">
          {allCards.map((card, index) => (
            <button
              key={`${card.type}-${card.preset.id}-${index}`}
              onClick={card.onClick}
              className="group flex flex-col items-center justify-center gap-2.5 rounded-xl border border-border/50 bg-background/60 dark:bg-background/40 p-3 transition-all duration-200 hover:border-primary/40 hover:bg-accent/80 hover:shadow-md active:scale-[0.96]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/80 dark:bg-muted/60 text-muted-foreground transition-all duration-200 group-hover:bg-primary/10 group-hover:text-primary group-hover:scale-110">
                {card.icon}
              </div>
              <div className="text-center space-y-0.5">
                <div className="text-[10px] font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 tracking-tight">
                  {card.title}
                </div>
                <div className="text-[9px] text-muted-foreground/80 line-clamp-1">
                  {card.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
