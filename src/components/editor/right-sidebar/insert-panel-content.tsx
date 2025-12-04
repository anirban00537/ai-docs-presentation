"use client";

import React from "react";
import {
  LayoutTemplate,
  Star,
  Tag,
  List,
  ListOrdered,
  Quote,
  Image as ImageIcon,
  PanelsLeftRight,
  Sparkles,
  DollarSign,
} from "lucide-react";
import type {
  FeatureCardPreset,
  IconCardPreset,
  ImageCardPreset,
  LabelCardPreset,
  ListCardPreset,
  QuotePreset,
  ComparisonCardPreset,
  TitleCardPreset,
  PricingCardPreset,
} from "@/components/editor/types";
import { useAppSelector } from "@/store/hooks";
import { selectGlobalTheme } from "@/store/slices/slidesSlice";
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

const titleCardPresets: TitleCardPreset[] = [
  {
    id: "default",
    eyebrow: "Presentation",
    title: "Title Card",
    subtitle: "Add a short supporting subheading",
  },
];

const pricingCardPresets: PricingCardPreset[] = [
  {
    id: "default",
    planName: "Starter",
    price: "$29",
    period: "/mo",
    badge: "Popular",
    features: ["Up to 5 projects", "10GB storage", "Email support"],
    buttonText: "Get Started",
  },
  {
    id: "pro",
    planName: "Professional",
    price: "$99",
    period: "/mo",
    features: [
      "Unlimited projects",
      "100GB storage",
      "Priority support",
      "Advanced analytics",
    ],
    buttonText: "Get Started",
  },
];

type InsertPanelContentProps = {
  onAddFeatureCard?: (preset: FeatureCardPreset) => void;
  onAddIconCard?: (preset: IconCardPreset) => void;
  onAddImageCard?: (preset: ImageCardPreset) => void;
  onAddLabelCard?: (preset: LabelCardPreset) => void;
  onAddListCard?: (preset: ListCardPreset) => void;
  onAddQuote?: (preset: QuotePreset) => void;
  onAddComparisonCard?: (preset: ComparisonCardPreset) => void;
  onAddTitleCard?: (preset: TitleCardPreset) => void;
  onAddPricingCard?: (preset: PricingCardPreset) => void;
};

export const InsertPanelContent: React.FC<InsertPanelContentProps> = ({
  onAddFeatureCard,
  onAddIconCard,
  onAddImageCard,
  onAddLabelCard,
  onAddListCard,
  onAddQuote,
  onAddComparisonCard,
  onAddTitleCard,
  onAddPricingCard,
}) => {
  const globalTheme = useAppSelector(selectGlobalTheme);
  const isDarkTheme = globalTheme?.tone === "dark";
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

  const handleAddTitleCard = (preset: TitleCardPreset) => {
    onAddTitleCard?.(preset);
  };

  const handleAddPricingCard = (preset: PricingCardPreset) => {
    onAddPricingCard?.(preset);
  };

  // Combine all card presets into a single array for the grid
  const allCards = [
    ...titleCardPresets.map((preset) => ({
      type: "title" as const,
      preset,
      icon: <Sparkles className="h-4 w-4" />,
      title: "Title Card",
      description: "Large title block",
      onClick: () => handleAddTitleCard(preset),
    })),
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
    ...pricingCardPresets.map((preset) => ({
      type: "pricing" as const,
      preset,
      icon: <DollarSign className="h-4 w-4" />,
      title: "Pricing Card",
      description: preset.planName || "Pricing plan",
      onClick: () => handleAddPricingCard(preset),
    })),
  ];

  return (
    <div className="space-y-7 py-4">
      {/* All Cards */}
      <div className="space-y-3">
        <div className="mx-4 space-y-1">
          {allCards.map((card, index) => (
            <button
              key={`${card.type}-${card.preset.id}-${index}`}
              onClick={card.onClick}
              className={cn(
                "group w-full flex items-center gap-3 rounded-lg px-3 py-2.5",
                "transition-all duration-300 ease-out",
                "hover:bg-primary/10 hover:border-primary/40",
                "active:scale-[0.98]",
                isDarkTheme ? "hover:bg-white/10" : "hover:bg-accent/80"
              )}
              style={{
                animationDelay: `${index * 25}ms`,
                animation: "fadeInUp 0.4s ease-out both",
              }}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md shrink-0",
                  "transition-all duration-300 ease-out",
                  "group-hover:bg-primary/10 group-hover:text-primary",
                  isDarkTheme
                    ? "bg-white/5 text-white/70"
                    : "bg-muted/80 text-muted-foreground"
                )}
              >
                {card.icon}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div
                  className={cn(
                    "text-xs font-medium group-hover:text-primary",
                    "transition-colors duration-300 ease-out line-clamp-1",
                    isDarkTheme ? "text-white/90" : "text-foreground"
                  )}
                >
                  {card.title}
                </div>
                <div
                  className={cn(
                    "text-[10px] line-clamp-1 transition-opacity duration-300 ease-out mt-0.5",
                    "group-hover:opacity-100",
                    isDarkTheme
                      ? "text-white/60 opacity-70"
                      : "text-muted-foreground/80 opacity-70"
                  )}
                >
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
