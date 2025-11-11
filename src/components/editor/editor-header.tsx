"use client";

import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
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

export type ShapePreset = {
  id: string;
  title: string;
  description: string;
  preview: string;
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

const shapeItems: ShapePreset[] = [
  {
    id: "rectangle",
    title: "Rectangle",
    description: "Create banners, callouts, and structured layouts.",
    preview: "Rect",
  },
  {
    id: "circle",
    title: "Circle",
    description: "Highlight focal points with rounded shapes.",
    preview: "Circ",
  },
  {
    id: "arrow",
    title: "Arrow",
    description: "Guide attention to important areas of the slide.",
    preview: "Arrow",
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
  return (
    <header className="flex h-16 shrink-0 items-center border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 data-[orientation=vertical]:h-4"
      />
      <div className="flex flex-1 items-center justify-center gap-2">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Type className="h-4 w-4" />
              Text
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="center">
            <DropdownMenuLabel>Text presets</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {textItems.map((item) => (
              <DropdownMenuItem
                key={item.title}
                className="flex flex-col items-start gap-1 px-3 py-2"
                onSelect={() => {
                  onAddText(item);
                }}
              >
                <span className="text-sm font-medium text-foreground">
                  {item.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  {item.description}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Shapes className="h-4 w-4" />
              Shapes
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-72" align="center">
            <DropdownMenuLabel>Shape options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {shapeItems.map((item) => (
              <DropdownMenuItem
                key={item.title}
                className="flex items-center gap-3 px-3 py-2"
                onSelect={() => {
                  onAddShape?.(item);
                }}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-md border border-dashed border-muted-foreground/40 bg-muted/30 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {item.preview}
                </span>
                <span className="flex flex-col text-left">
                  <span className="text-sm font-medium text-foreground">
                    {item.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {item.description}
                  </span>
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="w-4" />
    </header>
  );
};
