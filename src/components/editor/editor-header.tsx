"use client";

import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Shapes, Type } from "lucide-react";

export type TextPreset = {
  id: string;
  title: string;
  description: string;
};

export type ShapeCategory = "essential" | "outlined" | "lines";

export type ShapePreset = {
  id: string;
  title: string;
  category: ShapeCategory;
  preview: React.ReactNode;
};

const textItems: TextPreset[] = [
  {
    id: "heading",
    title: "Heading",
    description: "Large statement text for slide titles.",
  },
  {
    id: "subheading",
    title: "Subheading",
    description: "Introduce key talking points with medium text.",
  },
  {
    id: "body",
    title: "Body Text",
    description: "Standard paragraph text for supporting details.",
  },
];

const PREVIEW_FILL = "#1f2937";
const PREVIEW_STROKE = "#1f2937";
const PREVIEW_STROKE_WIDTH = 6;

const shapeCategories: Array<{ id: ShapeCategory; label: string }> = [
  { id: "essential", label: "Essential" },
  { id: "outlined", label: "Outlined" },
  { id: "lines", label: "Lines" },
];

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
      className="h-8 w-10"
      preserveAspectRatio="xMidYMid meet"
    >
      <line
        x1="10"
        y1="40"
        x2="150"
        y2="40"
        stroke="#14B8A6"
        strokeWidth={8}
        strokeLinecap="round"
      />
      <polygon points="150,22 190,40 150,58" fill="#14B8A6" />
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
};

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  onAddText,
  onAddShape,
}) => {
  const [activeShapeCategory, setActiveShapeCategory] =
    React.useState<ShapeCategory>("essential");

  const filteredShapeItems = React.useMemo(
    () => shapeItems.filter((item) => item.category === activeShapeCategory),
    [activeShapeCategory]
  );

  const activeCategoryLabel =
    shapeCategories.find((category) => category.id === activeShapeCategory)
      ?.label ?? "Shapes";

  return (
    <header className="flex h-14 shrink-0 items-center px-4 border-b border-border/50 bg-background/95 backdrop-blur-sm">
      <SidebarTrigger className="-ml-1 h-8 w-8 hover:bg-accent/60 transition-colors" />
      <Separator
        orientation="vertical"
        className="mr-3 data-[orientation=vertical]:h-5"
      />
      <div className="flex flex-1 items-center justify-center gap-2">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 h-9 px-3 font-medium hover:bg-accent/60 transition-all"
            >
              <Type className="h-4 w-4" />
              Text
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 rounded-lg border-border/50" align="center">
            <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Text presets
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {textItems.map((item) => (
              <DropdownMenuItem
                key={item.title}
                className="flex flex-col items-start gap-1 px-3 py-2.5 hover:bg-accent/60 cursor-pointer transition-colors"
                onSelect={() => {
                  onAddText(item);
                }}
              >
                <span className="text-sm font-semibold text-foreground">
                  {item.title}
                </span>
                <span className="text-xs text-muted-foreground leading-relaxed">
                  {item.description}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu
          modal={false}
          onOpenChange={(open) => {
            if (open) {
              setActiveShapeCategory("essential");
            }
          }}
        >
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 h-9 px-3 font-medium hover:bg-accent/60 transition-all"
            >
              <Shapes className="h-4 w-4" />
              Shapes
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[460px] rounded-lg p-0 border-border/50"
            align="center"
          >
            <div className="flex">
              <div className="flex w-40 flex-col bg-gradient-to-b from-muted/50 to-muted/30 p-2 border-r border-border/50">
                {shapeCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    className={cn(
                      "rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all duration-200",
                      activeShapeCategory === category.id
                        ? "bg-background text-foreground border border-border/50"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                    )}
                    onClick={() => setActiveShapeCategory(category.id)}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-1 flex-col gap-4 p-4 bg-background">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {activeCategoryLabel}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    Edit
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {filteredShapeItems.map((item) => (
                    <DropdownMenuItem asChild key={item.id}>
                      <button
                        type="button"
                        className="flex flex-col items-center gap-2 rounded-lg border border-border/50 bg-background p-3 text-center transition-all duration-200 hover:border-primary/50 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                        onClick={() => {
                          onAddShape?.(item);
                        }}
                      >
                        {item.preview}
                        <span className="text-xs font-semibold text-foreground">
                          {item.title}
                        </span>
                      </button>
                    </DropdownMenuItem>
                  ))}
                </div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="w-4" />
    </header>
  );
};
