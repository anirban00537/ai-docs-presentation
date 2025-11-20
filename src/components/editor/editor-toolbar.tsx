"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Shapes, Type, Square, Palette, Plus } from "lucide-react";
import { BackgroundSection } from "@/components/editor/background/background-section";
import { BackgroundImageSection } from "@/components/editor/background/background-image-section";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectActiveSlide, updateSlide } from "@/store/slices/slidesSlice";
import {
  ArrowPreview,
  CirclePreview,
  PolygonPreview,
  SquarePreview,
} from "@/components/editor/shape-previews";

export type TextPreset = {
  id: string;
  title: string;
};

export type ShapeCategory = "essential" | "outlined" | "lines";

export type ShapePreset = {
  id: string;
  title: string;
  category: ShapeCategory;
  preview: React.ReactNode;
};

export type FeatureCardPreset = {
  id: string;
  title: string;
  description: string;
};

const textItems: TextPreset[] = [
  {
    id: "heading",
    title: "Heading",
  },
  {
    id: "subheading",
    title: "Subheading",
  },
  {
    id: "body",
    title: "Body Text",
  },
];

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

type EditorHeaderProps = {
  onAddText: (preset: TextPreset) => void;
  onAddShape?: (preset: ShapePreset) => void;
  onAddFeatureCard?: (preset: FeatureCardPreset) => void;
};

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  onAddText,
  onAddShape,
  onAddFeatureCard,
}) => {
  const dispatch = useAppDispatch();
  const activeSlide = useAppSelector(selectActiveSlide);

  const handleBackgroundColorChange = React.useCallback(
    (color: string) => {
      if (!activeSlide) return;
      dispatch(
        updateSlide({
          slideId: activeSlide.id,
          updates: {
            backgroundColor: color,
            backgroundType: "solid",
          },
        })
      );
    },
    [activeSlide, dispatch]
  );

  const handleBackgroundTypeChange = React.useCallback(
    (type: "solid" | "gradient") => {
      if (!activeSlide) return;
      dispatch(
        updateSlide({
          slideId: activeSlide.id,
          updates: { backgroundType: type },
        })
      );
    },
    [activeSlide, dispatch]
  );

  const handleGradientColorChange = React.useCallback(
    (index: number, color: string) => {
      if (!activeSlide) return;
      const currentGradient = activeSlide.backgroundGradient || [
        "#ffffff",
        "#f0f0f0",
      ];
      const next = [...currentGradient];
      next[index] = color;
      dispatch(
        updateSlide({
          slideId: activeSlide.id,
          updates: {
            backgroundGradient: next,
            backgroundType: "gradient",
          },
        })
      );
    },
    [activeSlide, dispatch]
  );

  const handleAddGradientColor = React.useCallback(() => {
    if (!activeSlide) return;
    const currentGradient = activeSlide.backgroundGradient || [
      "#ffffff",
      "#f0f0f0",
    ];
    dispatch(
      updateSlide({
        slideId: activeSlide.id,
        updates: {
          backgroundGradient: [...currentGradient, "#ffffff"],
          backgroundType: "gradient",
        },
      })
    );
  }, [activeSlide, dispatch]);

  const handleRemoveGradientColor = React.useCallback(
    (index: number) => {
      if (!activeSlide) return;
      const currentGradient = activeSlide.backgroundGradient || [
        "#ffffff",
        "#f0f0f0",
      ];
      if (currentGradient.length <= 2) return;
      dispatch(
        updateSlide({
          slideId: activeSlide.id,
          updates: {
            backgroundGradient: currentGradient.filter((_, i) => i !== index),
            backgroundType: "gradient",
          },
        })
      );
    },
    [activeSlide, dispatch]
  );

  const handleGradientDirectionChange = React.useCallback(
    (direction: string) => {
      if (!activeSlide) return;
      dispatch(
        updateSlide({
          slideId: activeSlide.id,
          updates: {
            backgroundGradientDirection: direction,
            backgroundType: "gradient",
          },
        })
      );
    },
    [activeSlide, dispatch]
  );

  const handleBackgroundImageUpload = React.useCallback(
    (imageData: string) => {
      if (!activeSlide) return;
      dispatch(
        updateSlide({
          slideId: activeSlide.id,
          updates: { backgroundImage: imageData },
        })
      );
    },
    [activeSlide, dispatch]
  );

  const handleBackgroundImageRemove = React.useCallback(() => {
    if (!activeSlide) return;
    dispatch(
      updateSlide({
        slideId: activeSlide.id,
        updates: { backgroundImage: undefined },
      })
    );
  }, [activeSlide, dispatch]);

  return (
    <header className="pointer-events-auto fixed bottom-6 left-1/2 z-40 flex w-[520px] max-w-[90vw] -translate-x-1/2 items-center justify-center gap-2 rounded-full border border-border/60 bg-background/95 px-4 py-2 shadow-lg backdrop-blur-sm">
      <div className="flex flex-1 items-center justify-center gap-2">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="sm"
              className="gap-1.5 h-9 px-4 text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              Insert
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" sideOffset={12}>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Type className="mr-2 h-4 w-4" />
                Text
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-48" sideOffset={9}>
                {textItems.map((item) => (
                  <DropdownMenuItem
                    key={item.id}
                    onSelect={() => {
                      onAddText(item);
                    }}
                  >
                    {item.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Shapes className="mr-2 h-4 w-4" />
                Shapes
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent
                className="w-56 max-h-64 overflow-y-auto"
                sideOffset={9}
              >
                {shapeItems.map((item) => (
                  <DropdownMenuItem
                    key={item.id}
                    onSelect={() => {
                      onAddShape?.(item);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-8 w-8">{item.preview}</span>
                      <span>{item.title}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Square className="mr-2 h-4 w-4" />
                Feature Cards
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent
                className="w-56 max-h-56 overflow-y-auto"
                sideOffset={9}
              >
                {featureCardPresets.map((preset) => (
                  <DropdownMenuItem
                    key={preset.id}
                    onSelect={() => {
                      onAddFeatureCard?.(preset);
                    }}
                  >
                    {preset.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 h-8 px-2.5 text-xs font-medium hover:bg-accent/60 transition-all"
              disabled={!activeSlide}
            >
              <Palette className="h-3.5 w-3.5" />
              Background
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[400px] max-h-[75vh] overflow-y-auto rounded-lg border-border/50 px-3 py-4 custom-scrollbar"
            align="center"
            sideOffset={16}
          >
            {activeSlide ? (
              <div className="space-y-6">
                <section className="space-y-2">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Canvas
                    </h3>
                    <p className="text-[11px] text-muted-foreground/80">
                      Adjust solid colors or gradients for the slide background.
                    </p>
                  </div>
                  <BackgroundSection
                    backgroundColor={activeSlide.backgroundColor}
                    backgroundType={activeSlide.backgroundType}
                    backgroundGradient={activeSlide.backgroundGradient}
                    backgroundGradientDirection={
                      activeSlide.backgroundGradientDirection
                    }
                    onBackgroundColorChange={handleBackgroundColorChange}
                    onBackgroundTypeChange={handleBackgroundTypeChange}
                    onGradientColorChange={handleGradientColorChange}
                    onAddGradientColor={handleAddGradientColor}
                    onRemoveGradientColor={handleRemoveGradientColor}
                    onGradientDirectionChange={handleGradientDirectionChange}
                  />
                </section>

                <div className="h-px w-full bg-linear-to-r from-transparent via-border/60 to-transparent" />

                <section className="space-y-2">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Assets
                    </h3>
                    <p className="text-[11px] text-muted-foreground/80">
                      Upload or remove a background image.
                    </p>
                  </div>
                  <BackgroundImageSection
                    backgroundImage={activeSlide.backgroundImage}
                    onImageUpload={handleBackgroundImageUpload}
                    onImageRemove={handleBackgroundImageRemove}
                  />
                </section>
              </div>
            ) : (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Select a slide to customize its background.
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
