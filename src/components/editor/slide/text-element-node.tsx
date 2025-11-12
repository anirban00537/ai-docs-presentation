"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlignCenter, AlignLeft, AlignRight, Minus, Plus } from "lucide-react";
import type {
  TextElement,
  ResizeHandle,
} from "@/components/editor/slide/types";

const textResizeHandles: Array<{
  handle: Extract<ResizeHandle, "left" | "right">;
  className: string;
}> = [
  { handle: "left", className: "-left-1.5 top-1/2 -translate-y-1/2" },
  { handle: "right", className: "-right-1.5 top-1/2 -translate-y-1/2" },
];

const TOOLBAR_SELECTOR = '[data-text-toolbar="true"]';

const TEXT_STYLE_PRESETS = [
  {
    id: "title",
    label: "Title",
    fontSize: 96,
    fontWeight: 600,
    lineHeight: 1,
    align: "center" as const,
  },
  {
    id: "subtitle",
    label: "Subtitle",
    fontSize: 48,
    fontWeight: 500,
    lineHeight: 1.05,
    align: "center" as const,
  },
  {
    id: "body",
    label: "Body",
    fontSize: 24,
    fontWeight: 400,
    lineHeight: 1.4,
    align: "left" as const,
  },
];

const ALIGN_OPTIONS: Array<{
  value: TextElement["align"];
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
}> = [
  { value: "left", icon: AlignLeft, label: "Align left" },
  { value: "center", icon: AlignCenter, label: "Align center" },
  { value: "right", icon: AlignRight, label: "Align right" },
];

type TextElementNodeProps = {
  element: TextElement;
  isSelected: boolean;
  isEditing: boolean;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  getResizePointerDown: (
    handle: ResizeHandle
  ) => (event: React.PointerEvent<HTMLDivElement>) => void;
  editingTextareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onUpdateElement: (id: string, updates: Partial<TextElement>) => void;
  onStartEditing: (id: string) => void;
  onStopEditing: () => void;
};

export const TextElementNode: React.FC<TextElementNodeProps> = ({
  element,
  isSelected,
  isEditing,
  onPointerDown,
  getResizePointerDown,
  editingTextareaRef,
  onUpdateElement,
  onStartEditing,
  onStopEditing,
}) => {
  const contentRef = React.useRef<HTMLDivElement | HTMLTextAreaElement | null>(
    null
  );
  const lastAppliedHeightRef = React.useRef<number>(element.height);

  const setTextareaRef = React.useCallback(
    (node: HTMLTextAreaElement | null) => {
      if (editingTextareaRef) {
        editingTextareaRef.current = node;
      }
      contentRef.current = node;
    },
    [editingTextareaRef]
  );

  const setDisplayRef = React.useCallback((node: HTMLDivElement | null) => {
    contentRef.current = node;
  }, []);

  React.useEffect(() => {
    lastAppliedHeightRef.current = element.height;
  }, [element.height]);

  React.useLayoutEffect(() => {
    const node = contentRef.current;
    if (!node) {
      return;
    }

    if (node instanceof HTMLTextAreaElement) {
      node.style.height = "auto";
      node.style.height = `${node.scrollHeight}px`;
    }

    const measuredHeight =
      node instanceof HTMLTextAreaElement
        ? node.scrollHeight
        : node.offsetHeight;

    if (Number.isFinite(measuredHeight)) {
      const nextHeight = Math.max(1, measuredHeight);
      if (
        Math.abs(nextHeight - element.height) > 0.5 &&
        Math.abs(nextHeight - lastAppliedHeightRef.current) > 0.5
      ) {
        lastAppliedHeightRef.current = nextHeight;
        onUpdateElement(element.id, { height: nextHeight });
      }
    }
  }, [
    element.align,
    element.fontSize,
    element.fontWeight,
    element.height,
    element.id,
    element.lineHeight,
    element.text,
    element.width,
    isEditing,
    onUpdateElement,
  ]);

  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(TOOLBAR_SELECTOR)) {
        event.stopPropagation();
        return;
      }
      if (event.detail >= 2 && !isEditing) {
        event.stopPropagation();
        onStartEditing(element.id);
        return;
      }
      onPointerDown(event);
    },
    [element.id, isEditing, onPointerDown, onStartEditing]
  );

  return (
    <div
      className={cn(
        "canvas-element group absolute flex select-none border border-transparent transition",
        isSelected && !isEditing ? "border-blue-500/70" : "border-transparent",
        isEditing ? "cursor-text" : "cursor-move"
      )}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        zIndex: isSelected ? 20 : 10,
      }}
      onPointerDown={handlePointerDown}
      onDoubleClick={(event) => {
        const target = event.target as HTMLElement | null;
        if (target?.closest(TOOLBAR_SELECTOR)) {
          event.stopPropagation();
          return;
        }
        event.stopPropagation();
        onStartEditing(element.id);
      }}
    >
      <div className="canvas-element__content relative flex h-full w-full items-stretch justify-stretch rounded">
        {isSelected && (
          <TextEditingToolbar
            element={element}
            isEditing={isEditing}
            onUpdateElement={onUpdateElement}
          />
        )}
        {isEditing ? (
          <textarea
            ref={setTextareaRef}
            className="w-full resize-none border-none bg-transparent p-0 text-foreground outline-none focus:ring-0"
            style={{
              fontSize: element.fontSize,
              fontWeight: element.fontWeight,
              color: element.color,
              textAlign: element.align,
              lineHeight: element.lineHeight ?? 1.3,
            }}
            value={element.text}
            onChange={(event) =>
              onUpdateElement(element.id, { text: event.target.value })
            }
            onBlur={() => onStopEditing()}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                onStopEditing();
              }
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center">
            <div
              ref={setDisplayRef}
              className="w-full cursor-text whitespace-pre-wrap wrap-break-word"
              style={{
                fontSize: element.fontSize,
                fontWeight: element.fontWeight,
                color: element.color,
                textAlign: element.align,
                lineHeight: element.lineHeight ?? 1.3,
              }}
              onDoubleClick={(event) => {
                const target = event.target as HTMLElement | null;
                if (target?.closest(TOOLBAR_SELECTOR)) {
                  event.stopPropagation();
                  return;
                }
                event.stopPropagation();
                onStartEditing(element.id);
              }}
            >
              {element.text || "Start typing…"}
            </div>
          </div>
        )}

        {isSelected && !isEditing && (
          <>
            {textResizeHandles.map(({ handle, className }) => (
              <div
                key={handle}
                className={cn(
                  "absolute h-3 w-3 rounded-sm border border-white bg-blue-500 shadow-sm cursor-ew-resize",
                  className
                )}
                onPointerDown={getResizePointerDown(handle)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

type TextEditingToolbarProps = {
  element: TextElement;
  isEditing: boolean;
  onUpdateElement: (id: string, updates: Partial<TextElement>) => void;
};

const TextEditingToolbar: React.FC<TextEditingToolbarProps> = ({
  element,
  isEditing,
  onUpdateElement,
}) => {
  const [presetMenuOpen, setPresetMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!presetMenuOpen) {
      return;
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        event.target instanceof Node &&
        !menuRef.current.contains(event.target)
      ) {
        setPresetMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [presetMenuOpen]);

  const isBold = element.fontWeight >= 600;

  const applyPreset = React.useCallback(
    (presetId: string) => {
      const preset = TEXT_STYLE_PRESETS.find((item) => item.id === presetId);
      if (!preset) return;
      onUpdateElement(element.id, {
        fontSize: preset.fontSize,
        fontWeight: preset.fontWeight,
        lineHeight: preset.lineHeight,
        align: preset.align,
      });
    },
    [element.id, onUpdateElement]
  );

  const adjustFontSize = React.useCallback(
    (delta: number) => {
      const next = Math.min(
        300,
        Math.max(8, Math.round(element.fontSize + delta))
      );
      if (next !== element.fontSize) {
        onUpdateElement(element.id, { fontSize: next });
      }
    },
    [element.fontSize, element.id, onUpdateElement]
  );

  const handleFontSizeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    if (rawValue.trim() === "") {
      return;
    }
    const value = Number(rawValue);
    if (!Number.isFinite(value)) {
      return;
    }
    const next = Math.min(300, Math.max(8, Math.round(value)));
    if (next !== element.fontSize) {
      onUpdateElement(element.id, { fontSize: next });
    }
  };

  const toggleBold = () => {
    const nextWeight = isBold ? 400 : 700;
    onUpdateElement(element.id, { fontWeight: nextWeight });
  };

  const handleAlign = (align: TextElement["align"]) => {
    if (align !== element.align) {
      onUpdateElement(element.id, { align });
    }
  };

  const currentPresetLabel =
    TEXT_STYLE_PRESETS.find(
      (preset) =>
        preset.fontSize === element.fontSize &&
        preset.fontWeight === element.fontWeight &&
        Math.abs(
          preset.lineHeight - (element.lineHeight ?? preset.lineHeight)
        ) < 0.01
    )?.label ?? "Custom";

  return (
    <div
      data-text-toolbar="true"
      className={cn(
        "pointer-events-auto absolute left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-lg border border-border bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur",
        isEditing ? "top-full mt-2" : "-top-16"
      )}
      onPointerDown={(event) => {
        event.stopPropagation();
      }}
    >
      <div className="relative flex items-center gap-1" ref={menuRef}>
        <Button
          variant="outline"
          size="sm"
          className="min-w-[90px] justify-between px-3 py-1 text-xs font-medium"
          onClick={() => setPresetMenuOpen((prev) => !prev)}
        >
          {currentPresetLabel}
          <svg
            className={cn(
              "h-3 w-3 transition-transform",
              presetMenuOpen ? "rotate-180" : "rotate-0"
            )}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </Button>
        {presetMenuOpen && (
          <div className="absolute left-0 top-full z-40 mt-1 w-40 overflow-hidden rounded-md border border-border bg-white shadow-lg">
            {TEXT_STYLE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className="block w-full px-3 py-2 text-left text-xs hover:bg-accent"
                onClick={() => {
                  applyPreset(preset.id);
                  setPresetMenuOpen(false);
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-md"
          onClick={() => adjustFontSize(-4)}
          aria-label="Decrease font size"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          type="number"
          className="h-8 w-16 rounded-md text-center text-xs"
          value={Number.isFinite(element.fontSize) ? element.fontSize : 0}
          onChange={handleFontSizeInput}
          min={8}
          max={300}
        />
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-md"
          onClick={() => adjustFontSize(4)}
          aria-label="Increase font size"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant={isBold ? "default" : "ghost"}
          size="sm"
          className="rounded-md px-2 py-1 text-xs font-semibold"
          onClick={toggleBold}
          aria-pressed={isBold}
          aria-label="Toggle bold"
        >
          B
        </Button>
      </div>

      <div className="flex items-center gap-1">
        {ALIGN_OPTIONS.map(({ value, icon: Icon, label }) => (
          <Button
            key={value}
            variant="ghost"
            size="icon-sm"
            className={cn(
              "rounded-md",
              element.align === value
                ? "bg-primary/10 text-primary hover:bg-primary/10"
                : undefined
            )}
            onClick={() => handleAlign(value)}
            aria-pressed={element.align === value}
            title={label}
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
      </div>
    </div>
  );
};
