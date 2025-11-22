"use client";

import React from "react";
import { XIcon } from "lucide-react";
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
import { BackgroundSection } from "@/components/editor/background/background-section";
import { ThemeSelector } from "@/components/editor/theme-selector";

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

export type SidebarPanel = "insert" | "background" | "theme" | null;

type RightSidebarProps = {
  panel: SidebarPanel;
  onClose: () => void;
  // Insert panel props
  onAddText?: (preset: TextPreset) => void;
  onAddShape?: (preset: ShapePreset) => void;
  onAddFeatureCard?: (preset: FeatureCardPreset) => void;
  // Background panel props
  backgroundColor?: string;
  onBackgroundColorChange?: (color: string) => void;
  // Theme panel props
  activeThemeId?: string;
  onSelectTheme?: (themeId: string) => void;
};

export const RightSidebar: React.FC<RightSidebarProps> = ({
  panel,
  onClose,
  onAddText,
  onAddShape,
  onAddFeatureCard,
  backgroundColor,
  onBackgroundColorChange,
  activeThemeId,
  onSelectTheme,
}) => {
  const handleAddText = (preset: TextPreset) => {
    onAddText?.(preset);
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

  const handleSelectTheme = (themeId: string) => {
    onSelectTheme?.(themeId);
  };

  if (!panel) return null;

  const getTitle = () => {
    switch (panel) {
      case "insert":
        return "Insert Widget";
      case "background":
        return "Background Settings";
      case "theme":
        return "Theme Settings";
      default:
        return "";
    }
  };

  return (
    <div className="w-[400px] h-full bg-background border-l border-border/40 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border/40">
        <h2 className="text-lg font-semibold">{getTitle()}</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onClose}
        >
          <XIcon className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {panel === "insert" && (
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

            {/* Coming Soon */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Coming Soon
              </h3>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  disabled
                  className="w-full justify-start rounded-md py-1.5 text-xs opacity-50"
                >
                  <ImageIcon className="mr-2 h-3.5 w-3.5 opacity-70" />
                  Image
                </Button>
                <Button
                  variant="ghost"
                  disabled
                  className="w-full justify-start rounded-md py-1.5 text-xs opacity-50"
                >
                  <Quote className="mr-2 h-3.5 w-3.5 opacity-70" />
                  Quote
                </Button>
                <Button
                  variant="ghost"
                  disabled
                  className="w-full justify-start rounded-md py-1.5 text-xs opacity-50"
                >
                  <StickyNote className="mr-2 h-3.5 w-3.5 opacity-70" />
                  Sticky Note
                </Button>
              </div>
            </div>
          </div>
        )}

        {panel === "background" && (
          <section className="space-y-2">
            <div>
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Canvas
              </h3>
              <p className="text-[10px] text-muted-foreground/70">
                Adjust colors for the slide background.
              </p>
            </div>
            <BackgroundSection
              backgroundColor={backgroundColor}
              onBackgroundColorChange={onBackgroundColorChange || (() => {})}
            />
          </section>
        )}

        {panel === "theme" && (
          <ThemeSelector
            activeThemeId={activeThemeId}
            onSelectTheme={handleSelectTheme}
          />
        )}
      </div>
    </div>
  );
};

