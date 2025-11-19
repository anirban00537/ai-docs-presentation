"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Minus,
  Plus,
  ChevronDown,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  updateElement as updateElementAction,
  selectActiveSlideId,
} from "@/store/slices/slidesSlice";
import {
  startEditing as startEditingAction,
  stopEditing as stopEditingAction,
} from "@/store/slices/editorUiSlice";
import type {
  TextElement,
  ResizeHandle,
} from "@/components/editor/slide/types";
import { useDebouncedCallback } from "use-debounce";

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

const TEXT_COLORS = [
  "#0f172a", // slate-900
  "#1e293b", // slate-800
  "#334155", // slate-700
  "#475569", // slate-600
  "#64748b", // slate-500
  "#94a3b8", // slate-400
  "#cbd5e1", // slate-300
  "#e2e8f0", // slate-200
  "#f1f5f9", // slate-100
  "#ffffff", // white
  "#ef4444", // red-500
  "#f97316", // orange-500
  "#facc15", // yellow-500
  "#22c55e", // green-500
  "#0ea5e9", // sky-500
  "#6366f1", // indigo-500
  "#a855f7", // purple-500
  "#ec4899", // pink-500
];

type TextElementNodeProps = {
  element: TextElement;
  isSelected: boolean;
  isEditing: boolean;
  baseZIndex: number;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  getResizePointerDown: (
    handle: ResizeHandle
  ) => (event: React.PointerEvent<HTMLDivElement>) => void;
  editingTextareaRef: React.RefObject<HTMLTextAreaElement | null>;
};

const TextElementNodeBase: React.FC<TextElementNodeProps> = ({
  element,
  isSelected,
  isEditing,
  baseZIndex,
  onPointerDown,
  getResizePointerDown,
  editingTextareaRef,
}) => {
  const dispatch = useAppDispatch();
  const activeSlideId = useAppSelector(selectActiveSlideId);

  const contentRef = React.useRef<HTMLDivElement | HTMLTextAreaElement | null>(
    null
  );
  const lastAppliedHeightRef = React.useRef<number>(element.height);
  const [localText, setLocalText] = React.useState(element.text);

  const debouncedUpdateText = useDebouncedCallback((nextText: string) => {
    dispatch(
      updateElementAction({
        slideId: activeSlideId,
        elementId: element.id,
        updates: { text: nextText },
      })
    );
  }, 250);

  React.useEffect(() => {
    setLocalText((prev) => (prev === element.text ? prev : element.text));
  }, [element.id, element.text]);

  React.useEffect(() => {
    if (!isEditing) {
      debouncedUpdateText.flush();
    }
  }, [debouncedUpdateText, isEditing]);

  React.useEffect(() => {
    return () => {
      debouncedUpdateText.flush();
    };
  }, [debouncedUpdateText]);

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

  // Auto-focus textarea when entering edit mode
  React.useEffect(() => {
    if (isEditing && contentRef.current instanceof HTMLTextAreaElement) {
      contentRef.current.focus();
      // Move cursor to end of text
      const length = contentRef.current.value.length;
      contentRef.current.setSelectionRange(length, length);
    }
  }, [isEditing]);

  React.useLayoutEffect(() => {
    const node = contentRef.current;
    if (!node) {
      return;
    }

    if (node instanceof HTMLTextAreaElement) {
      node.style.height = "auto";
      node.style.height = `${node.scrollHeight}px`;
    }

    // For display divs, we need to measure the actual content height
    // which includes wrapped text when width is constrained
    const measuredHeight =
      node instanceof HTMLTextAreaElement
        ? node.scrollHeight
        : node.scrollHeight || node.offsetHeight;

    if (Number.isFinite(measuredHeight) && measuredHeight > 0) {
      const nextHeight = Math.max(1, measuredHeight);
      if (!isEditing && Math.abs(nextHeight - element.height) > 0.5) {
        lastAppliedHeightRef.current = nextHeight;
        dispatch(
          updateElementAction({
            slideId: activeSlideId,
            elementId: element.id,
            updates: { height: nextHeight },
          })
        );
      }
    }
  }, [
    activeSlideId,
    dispatch,
    element.align,
    element.fontSize,
    element.fontWeight,
    element.height,
    element.id,
    element.lineHeight,
    element.text,
    element.width,
    isEditing,
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
        dispatch(startEditingAction(element.id));
        return;
      }
      onPointerDown(event);
    },
    [dispatch, element.id, isEditing, onPointerDown]
  );

  return (
    <div
      className={cn(
        "canvas-element group absolute flex select-none border border-transparent transition",
        isSelected && !isEditing ? "border-primary/70" : "border-transparent",
        isEditing ? "cursor-text" : "cursor-move"
      )}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        // Use minHeight + height: auto to allow text to grow naturally
        // while respecting manual vertical resizing (if larger than content)
        minHeight: element.height,
        height: "auto",
        zIndex: baseZIndex,
      }}
      onPointerDown={handlePointerDown}
      onDoubleClick={(event) => {
        const target = event.target as HTMLElement | null;
        if (target?.closest(TOOLBAR_SELECTOR)) {
          event.stopPropagation();
          return;
        }
        event.stopPropagation();
        dispatch(startEditingAction(element.id));
      }}
    >
      <div className="canvas-element__content relative flex h-full w-full items-stretch justify-stretch rounded">
        {isSelected && (
          <TextEditingToolbar element={element} isEditing={isEditing} />
        )}
        {isEditing ? (
          <div className="flex h-full w-full items-start pt-1 px-1">
            <textarea
              ref={setTextareaRef}
              className="w-full resize-none border-none bg-transparent p-0 text-foreground outline-none focus:ring-0"
              style={{
                fontSize: element.fontSize,
                fontWeight: element.fontWeight,
                color: element.color,
                textAlign: element.align,
                lineHeight: element.lineHeight ?? 1.3,
                wordWrap: "break-word",
                overflowWrap: "break-word",
                // Ensure textarea grows with content
                height: "100%",
                overflow: "hidden",
              }}
              value={localText}
              onChange={(event) => {
                const { value } = event.target;
                setLocalText(value);
                debouncedUpdateText(value);
              }}
              onBlur={() => {
                debouncedUpdateText.flush();
                dispatch(stopEditingAction());
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  debouncedUpdateText.flush();
                  dispatch(stopEditingAction());
                }
              }}
            />
          </div>
        ) : (
          <div className="flex h-full w-full items-start pt-1 px-1">
            <div
              ref={setDisplayRef}
              className="w-full cursor-text whitespace-pre-wrap wrap-break-word"
              style={{
                fontSize: element.fontSize,
                fontWeight: element.fontWeight,
                color: element.color,
                textAlign: element.align,
                lineHeight: element.lineHeight ?? 1.3,
                wordWrap: "break-word",
                overflowWrap: "break-word",
              }}
              onDoubleClick={(event) => {
                const target = event.target as HTMLElement | null;
                if (target?.closest(TOOLBAR_SELECTOR)) {
                  event.stopPropagation();
                  return;
                }
                event.stopPropagation();
                dispatch(startEditingAction(element.id));
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
                  "absolute h-3 w-3 rounded-sm border border-white bg-primary cursor-ew-resize",
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

export const TextElementNode = React.memo(TextElementNodeBase);

type TextEditingToolbarProps = {
  element: TextElement;
  isEditing: boolean;
};

const TextEditingToolbar: React.FC<TextEditingToolbarProps> = ({
  element,
  isEditing,
}) => {
  const [presetMenuOpen, setPresetMenuOpen] = React.useState(false);
  const [colorMenuOpen, setColorMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  const colorMenuRef = React.useRef<HTMLDivElement | null>(null);
  const dispatch = useAppDispatch();
  const activeSlideId = useAppSelector(selectActiveSlideId);

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

  React.useEffect(() => {
    if (!colorMenuOpen) {
      return;
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (
        colorMenuRef.current &&
        event.target instanceof Node &&
        !colorMenuRef.current.contains(event.target)
      ) {
        setColorMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [colorMenuOpen]);

  const isBold = element.fontWeight >= 600;

  const applyPreset = React.useCallback(
    (presetId: string) => {
      const preset = TEXT_STYLE_PRESETS.find((item) => item.id === presetId);
      if (!preset) return;
      dispatch(
        updateElementAction({
          slideId: activeSlideId,
          elementId: element.id,
          updates: {
            fontSize: preset.fontSize,
            fontWeight: preset.fontWeight,
            lineHeight: preset.lineHeight,
            align: preset.align,
          },
        })
      );
    },
    [activeSlideId, dispatch, element.id]
  );

  const adjustFontSize = React.useCallback(
    (delta: number) => {
      const next = Math.min(
        300,
        Math.max(8, Math.round(element.fontSize + delta))
      );
      if (next !== element.fontSize) {
        dispatch(
          updateElementAction({
            slideId: activeSlideId,
            elementId: element.id,
            updates: { fontSize: next },
          })
        );
      }
    },
    [activeSlideId, dispatch, element.fontSize, element.id]
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
      dispatch(
        updateElementAction({
          slideId: activeSlideId,
          elementId: element.id,
          updates: { fontSize: next },
        })
      );
    }
  };

  const toggleBold = () => {
    const nextWeight = isBold ? 400 : 700;
    dispatch(
      updateElementAction({
        slideId: activeSlideId,
        elementId: element.id,
        updates: { fontWeight: nextWeight },
      })
    );
  };

  const handleAlign = (align: TextElement["align"]) => {
    if (align !== element.align) {
      dispatch(
        updateElementAction({
          slideId: activeSlideId,
          elementId: element.id,
          updates: { align },
        })
      );
    }
  };

  const handleSetColor = (color: string) => {
    dispatch(
      updateElementAction({
        slideId: activeSlideId,
        elementId: element.id,
        updates: { color },
      })
    );
    setColorMenuOpen(false);
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

      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground">
          Color
        </span>
        <div className="relative flex items-center" ref={colorMenuRef}>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 rounded-md border border-transparent px-2 py-1 text-xs"
            onClick={() => setColorMenuOpen((prev) => !prev)}
          >
            <TextColorSwatch color={element.color} />
            <span className="text-[11px] font-medium text-muted-foreground">
              Custom
            </span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </Button>
          {colorMenuOpen && (
            <TextColorPopover>
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-6 gap-1">
                  {TEXT_COLORS.map((color) => (
                    <TextColorChip
                      key={color}
                      color={color}
                      active={color === element.color}
                      onSelect={() => handleSetColor(color)}
                    />
                  ))}
                </div>
              </div>
            </TextColorPopover>
          )}
        </div>
      </div>
    </div>
  );
};

const TextColorPopover: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="absolute left-0 top-10 z-40 min-w-[180px] rounded-md border border-border bg-white p-3 shadow-lg">
    {children}
  </div>
);

type TextColorChipProps = {
  color: string;
  active: boolean;
  onSelect: () => void;
};

const TextColorChip: React.FC<TextColorChipProps> = ({
  color,
  active,
  onSelect,
}) => (
  <button
    type="button"
    aria-label={color}
    className={cn(
      "flex size-6 items-center justify-center rounded-full border border-transparent transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
      active ? "border-ring ring-2 ring-ring/30" : "border-border"
    )}
    onClick={onSelect}
  >
    <span
      className="block size-4 rounded-full border border-white/70"
      style={{ backgroundColor: color }}
    />
  </button>
);

const TextColorSwatch: React.FC<{ color: string }> = ({ color }) => {
  return (
    <span
      className="block size-4 rounded-full border border-white/70"
      style={{ backgroundColor: color }}
    />
  );
};
