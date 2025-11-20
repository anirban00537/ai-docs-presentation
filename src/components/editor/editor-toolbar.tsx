"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Shapes, Type, Square, Palette } from "lucide-react";
import { BackgroundSection } from "@/components/editor/background/background-section";
import { BackgroundImageSection } from "@/components/editor/background/background-image-section";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectActiveSlide, updateSlide } from "@/store/slices/slidesSlice";

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

const PREVIEW_FILL = "#1f2937";
const PREVIEW_STROKE = "#1f2937";
const PREVIEW_STROKE_WIDTH = 6;

const ShapePreviewFrame: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <span className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-muted/40">
    {children}
  </span>
);

const SquarePreview: React.FC<{ rounded?: boolean; outline?: boolean }> = ({
  rounded = false,
  outline = false,
}) => (
  <ShapePreviewFrame>
    <span
      className={cn(
        "block h-7 w-7",
        rounded ? "rounded-2xl" : "rounded-md",
        outline ? "bg-transparent border" : ""
      )}
      style={
        outline
          ? {
              borderColor: PREVIEW_STROKE,
              borderWidth: PREVIEW_STROKE_WIDTH / 2,
            }
          : { backgroundColor: PREVIEW_FILL }
      }
    />
  </ShapePreviewFrame>
);

const CirclePreview: React.FC<{ outline?: boolean }> = ({
  outline = false,
}) => (
  <ShapePreviewFrame>
    <span
      className="block h-7 w-7 rounded-full"
      style={
        outline
          ? {
              backgroundColor: "transparent",
              borderColor: PREVIEW_STROKE,
              borderWidth: PREVIEW_STROKE_WIDTH / 2,
              borderStyle: "solid",
            }
          : { backgroundColor: PREVIEW_FILL }
      }
    />
  </ShapePreviewFrame>
);

const PolygonPreview: React.FC<{
  points: string;
  outline?: boolean;
}> = ({ points, outline = false }) => (
  <ShapePreviewFrame>
    <svg
      viewBox="0 0 100 100"
      className="h-9 w-9"
      preserveAspectRatio="xMidYMid meet"
    >
      <polygon
        points={points}
        fill={outline ? "transparent" : PREVIEW_FILL}
        stroke={outline ? PREVIEW_STROKE : "transparent"}
        strokeWidth={outline ? PREVIEW_STROKE_WIDTH : 0}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  </ShapePreviewFrame>
);

const ArrowPreview: React.FC = () => (
  <ShapePreviewFrame>
    <svg
      viewBox="0 0 200 80"
      className="h-8 w-10 text-primary"
      preserveAspectRatio="xMidYMid meet"
    >
      <line
        x1="10"
        y1="40"
        x2="150"
        y2="40"
        stroke="currentColor"
        strokeWidth={8}
        strokeLinecap="round"
      />
      <polygon points="150,22 190,40 150,58" fill="currentColor" />
    </svg>
  </ShapePreviewFrame>
);

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
    <header className="pointer-events-auto fixed bottom-6 left-1/2 z-40 flex w-[680px] max-w-[90vw] -translate-x-1/2 items-center justify-center gap-1.5 rounded-full border border-border/60 bg-background/95 px-4 py-2 shadow-lg backdrop-blur-sm">
      <div className="flex flex-1 items-center justify-center gap-1.5">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 h-8 px-2.5 text-xs font-medium hover:bg-accent/60 transition-all"
            >
              <Type className="h-3.5 w-3.5" />
              Text
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-64 rounded-lg border-border/50 py-1.5"
            align="center"
          >
            {textItems.map((item) => (
              <DropdownMenuItem
                key={item.title}
                className="flex flex-col items-start gap-0.5 px-3 py-2 text-left hover:bg-accent/30 cursor-pointer transition-colors"
                onSelect={() => {
                  onAddText(item);
                }}
              >
                <span className="text-[13px] font-semibold leading-tight text-foreground">
                  {item.title}
                </span>
                <DropdownMenuSeparator className="my-1" />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 h-8 px-2.5 text-xs font-medium hover:bg-accent/60 transition-all"
            >
              <Shapes className="h-3.5 w-3.5" />
              Shapes
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-72 rounded-lg border-border/50 p-2"
            align="center"
          >
            <div className="h-64 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {shapeItems.map((item) => (
                <DropdownMenuItem
                  key={item.id}
                  className="flex items-center gap-3 rounded-md px-2.5 py-2 text-xs font-medium text-foreground hover:bg-accent/30 focus:bg-accent/30"
                  onSelect={() => {
                    onAddShape?.(item);
                  }}
                >
                  <span className="flex h-9 w-9 items-center justify-center">
                    <span className="scale-90">{item.preview}</span>
                  </span>
                  <span className="truncate">{item.title}</span>
                </DropdownMenuItem>
              ))}
            </div>
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
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 h-8 px-2.5 text-xs font-medium hover:bg-accent/60 transition-all"
            >
              <Square className="h-3.5 w-3.5" />
              Feature Card
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-64 rounded-lg border-border/50"
            align="center"
          >
            <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Feature Card
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex flex-col items-start gap-1 px-3 py-2.5 hover:bg-accent/60 cursor-pointer transition-colors"
              onSelect={() => {
                onAddFeatureCard?.({
                  id: "default",
                  title: "Multiple AI models",
                  description:
                    "Supports various AI models beyond Google's Gemini, including open source alternatives like GPT-OSS.",
                });
              }}
            >
              <span className="text-sm font-semibold text-foreground">
                Default Feature Card
              </span>
              <span className="text-xs text-muted-foreground leading-relaxed">
                Add a feature card with customizable number, title, and
                description.
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
