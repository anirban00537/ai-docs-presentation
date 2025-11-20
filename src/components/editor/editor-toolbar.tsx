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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import {
  Shapes,
  Type,
  Square,
  Palette,
  Plus,
  Heading1,
  Heading2,
  Pilcrow,
  LayoutTemplate,
  ImageIcon,
  Quote,
  StickyNote,
  FlaskConical,
} from "lucide-react";
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
    <header className="pointer-events-auto fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border/50 bg-background/30 p-2 shadow-2xl backdrop-blur-2xl transition-all hover:border-border/80 hover:bg-background/40 hover:shadow-3xl">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            size="sm"
            className="h-9 rounded-full px-4 text-sm font-medium shadow-sm transition-colors hover:bg-secondary/80"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Insert
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="center"
          sideOffset={20}
          className="w-64 rounded-2xl border border-border/60 bg-background/80 p-2 shadow-2xl backdrop-blur-xl"
        >
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground px-2 py-1.5">
            Insert widget
          </DropdownMenuLabel>

          <DropdownMenuItem
            onSelect={() => onAddText({ id: "body", title: "Body Text" })}
            className="rounded-lg py-2"
          >
            <Pilcrow className="mr-2 h-4 w-4 text-muted-foreground" />
            Paragraph
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => onAddText({ id: "heading", title: "Heading" })}
            className="rounded-lg py-2"
          >
            <Heading1 className="mr-2 h-4 w-4 text-muted-foreground" />
            Heading
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() =>
              onAddText({ id: "subheading", title: "Subheading" })
            }
            className="rounded-lg py-2"
          >
            <Heading2 className="mr-2 h-4 w-4 text-muted-foreground" />
            Subheading
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1" />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="rounded-lg py-2">
              <FlaskConical className="mr-2 h-4 w-4 text-muted-foreground" />
              Diagrams (Shapes)
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                className="w-64 rounded-2xl border border-border/60 !bg-background/90 p-2 shadow-2xl backdrop-blur-xl z-[100]"
                sideOffset={10}
                alignOffset={-400}
              >
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground px-2 py-1.5">
                  Shapes
                </DropdownMenuLabel>
                {shapeItems.map((item) => (
                  <DropdownMenuItem
                    key={item.id}
                    onSelect={() => {
                      onAddShape?.(item);
                    }}
                    className="rounded-lg py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-6 w-6 flex items-center justify-center">
                        {item.preview}
                      </span>
                      <span>{item.title}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="rounded-lg py-2">
              <LayoutTemplate className="mr-2 h-4 w-4 text-muted-foreground" />
              Cards
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                className="w-64 rounded-2xl border border-border/60 !bg-background/90 p-2 shadow-2xl backdrop-blur-xl z-[100]"
                sideOffset={10}
              >
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground px-2 py-1.5">
                  Feature Cards
                </DropdownMenuLabel>
                {featureCardPresets.map((preset) => (
                  <DropdownMenuItem
                    key={preset.id}
                    onSelect={() => {
                      onAddFeatureCard?.(preset);
                    }}
                    className="rounded-lg py-2"
                  >
                    {preset.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSeparator className="my-1" />

          <DropdownMenuItem disabled className="rounded-lg py-2 opacity-50">
            <ImageIcon className="mr-2 h-4 w-4 text-muted-foreground" />
            Image
          </DropdownMenuItem>
          <DropdownMenuItem disabled className="rounded-lg py-2 opacity-50">
            <Quote className="mr-2 h-4 w-4 text-muted-foreground" />
            Quote
          </DropdownMenuItem>
          <DropdownMenuItem disabled className="rounded-lg py-2 opacity-50">
            <StickyNote className="mr-2 h-4 w-4 text-muted-foreground" />
            Sticky Note
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="h-4 w-px bg-border/40 mx-1" />

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 rounded-full px-4 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
            disabled={!activeSlide}
          >
            <Palette className="mr-1.5 h-4 w-4" />
            Background
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[400px] max-h-[75vh] overflow-y-auto rounded-3xl border border-border/60 bg-background/80 px-3 py-4 custom-scrollbar shadow-2xl backdrop-blur-xl"
          align="center"
          sideOffset={20}
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
    </header>
  );
};
