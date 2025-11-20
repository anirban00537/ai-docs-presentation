"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AlignCenter, AlignLeft, AlignRight, ChevronDown } from "lucide-react";
import type {
  FeatureCardWidget,
  ResizeHandle,
} from "@/components/editor/widgets/types";
import { ResizeHandles } from "@/components/editor/resize-handles";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectActiveSlideId,
  updateWidget as updateWidgetAction,
} from "@/store/slices/slidesSlice";
import { useDebouncedCallback } from "use-debounce";

type FeatureCardWidgetNodeProps = {
  widget: FeatureCardWidget;
  isSelected: boolean;
  isEditing: boolean;
  baseZIndex: number;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  getResizePointerDown: (
    handle: ResizeHandle
  ) => (event: React.PointerEvent<HTMLDivElement>) => void;
};

type EditingField = "number" | "title" | "description" | null;

const TOOLBAR_SELECTOR = '[data-feature-card-toolbar="true"]';

const BACKGROUND_COLORS = [
  "#ffffff", // white
  "#f8fafc", // slate-50
  "#f1f5f9", // slate-100
  "#e2e8f0", // slate-200
  "#cbd5e1", // slate-300
  "#94a3b8", // slate-400
  "#64748b", // slate-500
  "#475569", // slate-600
  "#334155", // slate-700
  "#1e293b", // slate-800
  "#0f172a", // slate-900
  "#ef4444", // red-500
  "#f97316", // orange-500
  "#facc15", // yellow-500
  "#22c55e", // green-500
  "#0ea5e9", // sky-500
  "#6366f1", // indigo-500
  "#a855f7", // purple-500
  "#ec4899", // pink-500
];

const ALIGN_OPTIONS: Array<{
  value: "left" | "center" | "right";
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
}> = [
  { value: "left", icon: AlignLeft, label: "Align left" },
  { value: "center", icon: AlignCenter, label: "Align center" },
  { value: "right", icon: AlignRight, label: "Align right" },
];

const FeatureCardWidgetNodeBase: React.FC<FeatureCardWidgetNodeProps> = ({
  widget,
  isSelected,
  isEditing,
  baseZIndex,
  onPointerDown,
  getResizePointerDown,
}) => {
  const dispatch = useAppDispatch();
  const activeSlideId = useAppSelector(selectActiveSlideId);

  const [localNumber, setLocalNumber] = React.useState(widget.number || "01");
  const [localTitle, setLocalTitle] = React.useState(widget.title || "");
  const [localDescription, setLocalDescription] = React.useState(
    widget.description || ""
  );
  const [editingField, setEditingField] = React.useState<EditingField>(null);

  const numberInputRef = React.useRef<HTMLInputElement | null>(null);
  const titleInputRef = React.useRef<HTMLInputElement | null>(null);
  const descriptionTextareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  // Auto-resize textarea based on content
  React.useLayoutEffect(() => {
    const textarea = descriptionTextareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [localDescription]);

  const debouncedUpdateNumber = useDebouncedCallback((value: string) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { number: value },
      })
    );
  }, 250);

  const debouncedUpdateTitle = useDebouncedCallback((value: string) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { title: value },
      })
    );
  }, 250);

  const debouncedUpdateDescription = useDebouncedCallback((value: string) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { description: value },
      })
    );
  }, 250);

  React.useEffect(() => {
    setLocalNumber((prev) =>
      prev === widget.number ? prev : widget.number || "01"
    );
  }, [widget.number]);

  React.useEffect(() => {
    setLocalTitle((prev) =>
      prev === widget.title ? prev : widget.title || ""
    );
  }, [widget.title]);

  React.useEffect(() => {
    setLocalDescription((prev) =>
      prev === widget.description ? prev : widget.description || ""
    );
  }, [widget.description]);

  React.useEffect(() => {
    return () => {
      debouncedUpdateNumber.flush();
      debouncedUpdateTitle.flush();
      debouncedUpdateDescription.flush();
    };
  }, [debouncedUpdateNumber, debouncedUpdateTitle, debouncedUpdateDescription]);

  // Reset editing field when widget is deselected
  React.useEffect(() => {
    if (!isSelected) {
      setEditingField(null);
    }
  }, [isSelected]);

  // Focus input when entering edit mode
  React.useEffect(() => {
    if (editingField === "number" && numberInputRef.current) {
      numberInputRef.current.focus();
      numberInputRef.current.select();
    } else if (editingField === "title" && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    } else if (
      editingField === "description" &&
      descriptionTextareaRef.current
    ) {
      descriptionTextareaRef.current.focus();
      descriptionTextareaRef.current.select();
    }
  }, [editingField]);

  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement;
      // Don't start drag if clicking on toolbar, input/textarea
      if (
        target.closest(TOOLBAR_SELECTOR) ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA"
      ) {
        return;
      }
      if (event.detail > 1) {
        return;
      }
      onPointerDown(event);
    },
    [onPointerDown]
  );

  const handleFieldPointerDown = React.useCallback(
    (field: EditingField, event: React.PointerEvent) => {
      // If not selected, let the event bubble up to handlePointerDown to select the widget
      if (!isSelected) {
        return;
      }
      // If already selected, stop propagation and enter edit mode
      event.stopPropagation();
      if (event.detail === 1) {
        setEditingField(field);
      }
    },
    [isSelected]
  );

  const handleFieldClick = React.useCallback(
    (field: EditingField, event: React.MouseEvent) => {
      // If not selected, let the event bubble up to select the widget
      if (!isSelected) {
        return;
      }
      // If already selected, stop propagation and enter edit mode
      event.stopPropagation();
      setEditingField(field);
    },
    [isSelected]
  );

  const handleFieldBlur = React.useCallback(
    (field: EditingField) => {
      if (field === "number") {
        debouncedUpdateNumber.flush();
      } else if (field === "title") {
        debouncedUpdateTitle.flush();
      } else if (field === "description") {
        debouncedUpdateDescription.flush();
      }
      // Small delay to allow click outside to deselect
      setTimeout(() => {
        setEditingField(null);
      }, 100);
    },
    [debouncedUpdateNumber, debouncedUpdateTitle, debouncedUpdateDescription]
  );

  const handleFieldKeyDown = React.useCallback(
    (field: EditingField, event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (field === "number") {
          debouncedUpdateNumber.flush();
        } else if (field === "title") {
          debouncedUpdateTitle.flush();
        } else if (field === "description") {
          debouncedUpdateDescription.flush();
        }
        setEditingField(null);
      } else if (event.key === "Enter" && field !== "description") {
        event.preventDefault();
        handleFieldBlur(field);
      }
    },
    [
      debouncedUpdateNumber,
      debouncedUpdateTitle,
      debouncedUpdateDescription,
      handleFieldBlur,
    ]
  );

  // White background with black text design
  const backgroundColor = widget.backgroundColor ?? "#ffffff"; // white
  const numberColor = widget.numberColor ?? "#1f2937"; // gray-800 (dark)
  const titleColor = widget.titleColor ?? "#111827"; // gray-900 (darker)
  const descriptionColor = widget.descriptionColor ?? "#374151"; // gray-700 (dark)
  const textAlign = widget.textAlign ?? "left";

  return (
    <div
      className={cn(
        "canvas-element group absolute flex select-none border border-transparent transition",
        isSelected && !isEditing
          ? "border-primary/70 ring-1 ring-primary/60"
          : "border-transparent",
        "cursor-move"
      )}
      style={{
        left: widget.x,
        top: widget.y,
        width: widget.width,
        height: widget.height,
        zIndex: baseZIndex,
      }}
      onPointerDown={handlePointerDown}
    >
      <div className="canvas-element__content relative flex h-full w-full items-stretch justify-stretch rounded">
        {isSelected && (
          <FeatureCardEditingToolbar
            widget={widget}
            isEditing={isEditing || editingField !== null}
          />
        )}
        <div
          className="relative h-full w-full rounded-lg p-6"
          style={{
            backgroundColor,
          }}
        >
          <div className="flex h-full flex-col gap-3" style={{ textAlign }}>
            {/* Number field */}
            {editingField === "number" ? (
              <input
                ref={numberInputRef}
                type="text"
                className="w-full resize-none border-none bg-transparent p-0 outline-none focus:ring-0 cursor-text"
                style={{
                  fontSize: "3.75rem",
                  fontWeight: 700,
                  color: numberColor,
                  lineHeight: 1,
                }}
                value={localNumber}
                onChange={(e) => {
                  setLocalNumber(e.target.value);
                  debouncedUpdateNumber(e.target.value);
                }}
                onBlur={() => handleFieldBlur("number")}
                onKeyDown={(e) => handleFieldKeyDown("number", e)}
                placeholder="01"
              />
            ) : (
              <div
                data-field="number"
                className="text-6xl font-bold leading-none cursor-text"
                style={{ color: numberColor }}
                onClick={(e) => handleFieldClick("number", e)}
                onPointerDown={(e) => handleFieldPointerDown("number", e)}
              >
                {widget.number || "01"}
              </div>
            )}

            {/* Title field */}
            {editingField === "title" ? (
              <input
                ref={titleInputRef}
                type="text"
                className="w-full resize-none border-none bg-transparent p-0 outline-none focus:ring-0 cursor-text"
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 600,
                  color: titleColor,
                  lineHeight: 1.25,
                }}
                value={localTitle}
                onChange={(e) => {
                  setLocalTitle(e.target.value);
                  debouncedUpdateTitle(e.target.value);
                }}
                onBlur={() => handleFieldBlur("title")}
                onKeyDown={(e) => handleFieldKeyDown("title", e)}
                placeholder="Feature Title"
              />
            ) : (
              <div
                data-field="title"
                className="text-2xl font-semibold leading-tight cursor-text"
                style={{ color: titleColor }}
                onClick={(e) => handleFieldClick("title", e)}
                onPointerDown={(e) => handleFieldPointerDown("title", e)}
              >
                {widget.title || "Feature Title"}
              </div>
            )}

            {/* Description field */}
            {editingField === "description" ? (
              <textarea
                ref={descriptionTextareaRef}
                className="w-full resize-none border-none bg-transparent p-0 outline-none focus:ring-0 cursor-text overflow-hidden"
                style={{
                  fontSize: "0.875rem",
                  color: descriptionColor,
                  lineHeight: 1.5,
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  minHeight: "3rem",
                  overflow: "hidden",
                }}
                value={localDescription}
                onChange={(e) => {
                  setLocalDescription(e.target.value);
                  debouncedUpdateDescription(e.target.value);
                  // Auto-resize on change
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onBlur={() => handleFieldBlur("description")}
                onKeyDown={(e) => handleFieldKeyDown("description", e)}
                placeholder="Feature description goes here."
              />
            ) : (
              <div
                data-field="description"
                className="text-sm leading-relaxed cursor-text whitespace-pre-wrap"
                style={{ color: descriptionColor }}
                onClick={(e) => handleFieldClick("description", e)}
                onPointerDown={(e) => handleFieldPointerDown("description", e)}
              >
                {widget.description || "Feature description goes here."}
              </div>
            )}
          </div>
        </div>
        {isSelected && !isEditing && editingField === null && (
          <ResizeHandles getResizePointerDown={getResizePointerDown} />
        )}
      </div>
    </div>
  );
};

export const FeatureCardWidgetNode = React.memo(FeatureCardWidgetNodeBase);

type FeatureCardEditingToolbarProps = {
  widget: FeatureCardWidget;
  isEditing: boolean;
};

const FeatureCardEditingToolbar: React.FC<FeatureCardEditingToolbarProps> = ({
  widget,
  isEditing,
}) => {
  const [colorMenuOpen, setColorMenuOpen] = React.useState(false);
  const colorMenuRef = React.useRef<HTMLDivElement | null>(null);
  const dispatch = useAppDispatch();
  const activeSlideId = useAppSelector(selectActiveSlideId);

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

  const handleSetBackgroundColor = (color: string) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { backgroundColor: color },
      })
    );
    setColorMenuOpen(false);
  };

  const handleAlign = (align: "left" | "center" | "right") => {
    if (align !== (widget.textAlign ?? "left")) {
      dispatch(
        updateWidgetAction({
          slideId: activeSlideId,
          widgetId: widget.id,
          updates: { textAlign: align },
        })
      );
    }
  };

  const currentAlign = widget.textAlign ?? "left";
  const currentBackgroundColor = widget.backgroundColor ?? "#ffffff";

  return (
    <div
      data-feature-card-toolbar="true"
      className={cn(
        "pointer-events-auto absolute left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-lg border border-border bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur",
        isEditing ? "top-full mt-2" : "-top-16"
      )}
      onPointerDown={(event) => {
        event.stopPropagation();
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground">
          Background
        </span>
        <div className="relative flex items-center" ref={colorMenuRef}>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 rounded-md border border-transparent px-2 py-1 text-xs"
            onClick={() => setColorMenuOpen((prev) => !prev)}
          >
            <ColorSwatch color={currentBackgroundColor} />
            <span className="text-[11px] font-medium text-muted-foreground">
              Color
            </span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </Button>
          {colorMenuOpen && (
            <ColorPopover>
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-6 gap-1">
                  {BACKGROUND_COLORS.map((color) => (
                    <ColorChip
                      key={color}
                      color={color}
                      active={color === currentBackgroundColor}
                      onSelect={() => handleSetBackgroundColor(color)}
                    />
                  ))}
                </div>
              </div>
            </ColorPopover>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        {ALIGN_OPTIONS.map(({ value, icon: Icon, label }) => (
          <Button
            key={value}
            variant="ghost"
            size="icon-sm"
            className={cn(
              "rounded-md",
              currentAlign === value
                ? "bg-primary/10 text-primary hover:bg-primary/10"
                : undefined
            )}
            onClick={() => handleAlign(value)}
            aria-pressed={currentAlign === value}
            title={label}
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
      </div>
    </div>
  );
};

const ColorPopover: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="absolute left-0 top-10 z-40 min-w-[180px] rounded-md border border-border bg-white p-3 shadow-lg">
    {children}
  </div>
);

type ColorChipProps = {
  color: string;
  active: boolean;
  onSelect: () => void;
};

const ColorChip: React.FC<ColorChipProps> = ({ color, active, onSelect }) => (
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

const ColorSwatch: React.FC<{ color: string }> = ({ color }) => {
  return (
    <span
      className="block size-4 rounded-full border border-white/70"
      style={{ backgroundColor: color }}
    />
  );
};
