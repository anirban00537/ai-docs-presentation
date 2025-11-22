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
  ExternalLink,
  Play,
} from "lucide-react";
import { BackgroundSection } from "@/components/editor/background/background-section";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectActiveSlide,
  selectGlobalTheme,
  updateSlide,
  setSlideTheme,
} from "@/store/slices/slidesSlice";
import { ThemeSelector } from "@/components/editor/theme-selector";
import {
  ArrowPreview,
  CirclePreview,
  PolygonPreview,
  SquarePreview,
} from "@/components/editor/shape-previews";
import { SidebarTrigger } from "@/components/ui/sidebar";

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
  const globalTheme = useAppSelector(selectGlobalTheme);

  const handleBackgroundColorChange = React.useCallback(
    (color: string) => {
      if (!activeSlide) return;
      dispatch(
        updateSlide({
          slideId: activeSlide.id,
          updates: {
            // single-color background
            backgroundColor: color,
          },
        })
      );
    },
    [activeSlide, dispatch]
  );

  const handleThemeSelect = React.useCallback(
    (themeId: string) => {
      dispatch(
        setSlideTheme({
          themeId,
        })
      );
    },
    [dispatch]
  );

  return (
    <header className="pointer-events-auto w-full bg-background/95 border-b border-border/40 flex items-center justify-center gap-1 px-4 py-2 shadow-sm backdrop-blur-xl z-50">
      <div className="absolute left-4 flex items-center gap-3">
        <SidebarTrigger />
        <h1 className="text-sm font-semibold text-foreground">
          Presentation Title
        </h1>
      </div>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 rounded-md px-3 text-xs font-medium transition-colors hover:bg-primary/10 hover:text-primary data-[state=open]:bg-primary/10 data-[state=open]:text-primary"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Insert
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="center"
          sideOffset={10}
          className="w-64 rounded-md border border-border/40 bg-background/80 p-1.5 shadow-xl backdrop-blur-xl"
        >
          <DropdownMenuLabel className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 py-1.5">
            Insert widget
          </DropdownMenuLabel>

          <DropdownMenuItem
            onSelect={() => onAddText({ id: "body", title: "Body Text" })}
            className="rounded-md py-1.5 text-xs focus:bg-primary/10 focus:text-primary"
          >
            <Pilcrow className="mr-2 h-3.5 w-3.5 opacity-70" />
            Paragraph
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => onAddText({ id: "heading", title: "Heading" })}
            className="rounded-md py-1.5 text-xs focus:bg-primary/10 focus:text-primary"
          >
            <Heading1 className="mr-2 h-3.5 w-3.5 opacity-70" />
            Heading
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() =>
              onAddText({ id: "subheading", title: "Subheading" })
            }
            className="rounded-md py-1.5 text-xs focus:bg-primary/10 focus:text-primary"
          >
            <Heading2 className="mr-2 h-3.5 w-3.5 opacity-70" />
            Subheading
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1 bg-border/40" />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="rounded-md py-1.5 text-xs focus:bg-primary/10 focus:text-primary">
              <FlaskConical className="mr-2 h-3.5 w-3.5 opacity-70" />
              Diagrams (Shapes)
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                className="w-64 rounded-xl border border-border/40 bg-background/80 p-1.5 shadow-xl backdrop-blur-xl z-[100]"
                sideOffset={5}
                alignOffset={-5}
              >
                <DropdownMenuLabel className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                  Shapes
                </DropdownMenuLabel>
                {shapeItems.map((item) => (
                  <DropdownMenuItem
                    key={item.id}
                    onSelect={() => {
                      onAddShape?.(item);
                    }}
                    className="rounded-md py-1.5 text-xs focus:bg-primary/10 focus:text-primary"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-5 w-5 flex items-center justify-center opacity-70">
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
            <DropdownMenuSubTrigger className="rounded-md py-1.5 text-xs focus:bg-primary/10 focus:text-primary">
              <LayoutTemplate className="mr-2 h-3.5 w-3.5 opacity-70" />
              Cards
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                className="w-64 rounded-md border border-border/40 bg-background/80 p-1.5 shadow-xl backdrop-blur-xl z-[100]"
                sideOffset={5}
              >
                <DropdownMenuLabel className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                  Feature Cards
                </DropdownMenuLabel>
                {featureCardPresets.map((preset) => (
                  <DropdownMenuItem
                    key={preset.id}
                    onSelect={() => {
                      onAddFeatureCard?.(preset);
                    }}
                    className="rounded-md py-1.5 text-xs focus:bg-primary/10 focus:text-primary"
                  >
                    {preset.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSeparator className="my-1 bg-border/40" />

          <DropdownMenuItem
            disabled
            className="rounded-md py-1.5 text-xs opacity-50"
          >
            <ImageIcon className="mr-2 h-3.5 w-3.5 opacity-70" />
            Image
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled
            className="rounded-md py-1.5 text-xs opacity-50"
          >
            <Quote className="mr-2 h-3.5 w-3.5 opacity-70" />
            Quote
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled
            className="rounded-md py-1.5 text-xs opacity-50"
          >
            <StickyNote className="mr-2 h-3.5 w-3.5 opacity-70" />
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
            className="h-8 rounded-md px-3 text-xs font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary data-[state=open]:bg-primary/10 data-[state=open]:text-primary disabled:opacity-50"
            disabled={!activeSlide}
          >
            <Palette className="mr-1.5 h-3.5 w-3.5" />
            Background
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[400px] max-h-[75vh] overflow-y-auto rounded-md border border-border/40 bg-background/80 px-3 py-4 custom-scrollbar shadow-xl backdrop-blur-xl"
          align="center"
          sideOffset={10}
        >
          {activeSlide ? (
            <div className="space-y-6">
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
                  backgroundColor={activeSlide.backgroundColor}
                  onBackgroundColorChange={handleBackgroundColorChange}
                />
              </section>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-muted-foreground">
              Select a slide to customize its background.
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="h-4 w-px bg-border/40 mx-1" />

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 rounded-md px-3 text-xs font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary data-[state=open]:bg-primary/10 data-[state=open]:text-primary disabled:opacity-50"
            disabled={!activeSlide}
          >
            <LayoutTemplate className="mr-1.5 h-3.5 w-3.5" />
            Theme
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-64 rounded-md border border-border/40 bg-background/80 p-2.5 shadow-xl backdrop-blur-xl"
          align="center"
          sideOffset={10}
        >
          <ThemeSelector
            activeThemeId={globalTheme?.id}
            onSelectTheme={handleThemeSelect}
          />
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="absolute right-4 flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="h-8 rounded-md px-3 text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80"
        >
          <Play className="mr-1.5 h-3.5 w-3.5" />
          Play
        </Button>
        <Button
          variant="default"
          size="sm"
          className="h-8 rounded-md px-3 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
          Share
        </Button>
      </div>
    </header>
  );
};
