"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus, X, List, ListOrdered } from "lucide-react";
import type { ListWidget } from "./types";
import type { ResizeHandle } from "../types";
import { TOOLBAR_SELECTOR } from "./constants";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectActiveSlideId,
  updateWidget as updateWidgetAction,
} from "@/store/slices/slidesSlice";
import { useDebouncedCallback } from "use-debounce";
import type { Viewport } from "@/hooks/use-canvas-viewport";
import { ProseMirrorEditor } from "@/components/editor/prosemirror-editor";
import { WidgetToolbar } from "@/components/editor/widgets/shared/toolbar-controls/widget-toolbar";
import type { ToolbarControlConfig } from "@/components/editor/widgets/shared/toolbar-controls/types";
import {
  WidgetContainer,
  WidgetBackground,
  useWidgetPointerDown,
} from "@/components/editor/widgets/shared";

type ActiveField = "title" | "item" | null;

type ListCardWidgetNodeProps = {
  widget: ListWidget;
  isSelected: boolean;
  isEditing: boolean;
  baseZIndex: number;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  getResizePointerDown: (
    handle: ResizeHandle
  ) => (event: React.PointerEvent<HTMLDivElement>) => void;
  viewport: Viewport;
  containerRef: React.RefObject<HTMLElement | null>;
};

const ListCardWidgetNodeBase: React.FC<ListCardWidgetNodeProps> = ({
  widget,
  isSelected,
  isEditing,
  baseZIndex,
  onPointerDown,
  getResizePointerDown,
  viewport,
  containerRef,
}) => {
  const dispatch = useAppDispatch();
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const widgetRef = React.useRef<HTMLDivElement | null>(null);
  const [activeField, setActiveField] = React.useState<ActiveField>(null);

  const [localItems, setLocalItems] = React.useState<string[]>(
    widget.items && widget.items.length > 0 ? widget.items : [""]
  );
  const [localTitle, setLocalTitle] = React.useState(widget.title || "");
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);

  const debouncedUpdateItems = useDebouncedCallback((items: string[]) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { items },
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

  React.useEffect(() => {
    setLocalItems((prev) => {
      const widgetItems =
        widget.items && widget.items.length > 0 ? widget.items : [""];
      if (JSON.stringify(prev) === JSON.stringify(widgetItems)) {
        return prev;
      }
      return widgetItems;
    });
  }, [widget.items]);

  React.useEffect(() => {
    setLocalTitle((prev) =>
      prev === widget.title ? prev : widget.title || ""
    );
  }, [widget.title]);

  React.useEffect(() => {
    return () => {
      debouncedUpdateItems.flush();
      debouncedUpdateTitle.flush();
    };
  }, [debouncedUpdateItems, debouncedUpdateTitle]);

  // Reset active field when widget is deselected
  React.useEffect(() => {
    if (!isSelected) {
      setActiveField(null);
    }
  }, [isSelected]);

  const handlePointerDown = useWidgetPointerDown({
    onPointerDown,
    toolbarSelector: TOOLBAR_SELECTOR,
    additionalSelectors: [
      "[data-add-item]",
      "[data-remove-item]",
      "[data-list-item]",
    ],
  });

  const handleItemChange = React.useCallback(
    (index: number, value: string) => {
      if (!isSelected) return;
      const newItems = [...localItems];
      newItems[index] = value;
      setLocalItems(newItems);
      debouncedUpdateItems(newItems);
    },
    [isSelected, localItems, debouncedUpdateItems]
  );

  const handleAddItem = React.useCallback(() => {
    if (!isSelected) return;
    const newItems = [...localItems, ""];
    setLocalItems(newItems);
    debouncedUpdateItems(newItems);
    setEditingIndex(newItems.length - 1);
  }, [isSelected, localItems, debouncedUpdateItems]);

  const handleRemoveItem = React.useCallback(
    (index: number) => {
      if (!isSelected) return;
      if (localItems.length <= 1) return; // Keep at least one item
      const newItems = localItems.filter((_, i) => i !== index);
      setLocalItems(newItems);
      debouncedUpdateItems(newItems);
    },
    [isSelected, localItems, debouncedUpdateItems]
  );

  const handleItemKeyDown = React.useCallback(
    (index: number, event: KeyboardEvent) => {
      if (!isSelected) return;

      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleAddItem();
        return;
      }

      if (
        event.key === "Backspace" &&
        localItems[index] === "" &&
        localItems.length > 1
      ) {
        event.preventDefault();
        handleRemoveItem(index);
      }
    },
    [handleAddItem, handleRemoveItem, isSelected, localItems]
  );

  // Widget-local colors and fonts with sensible defaults
  const backgroundColor = widget.backgroundColor ?? "#ffffff";
  const titleColor = widget.titleColor ?? "#0f172a";
  const itemColor = widget.itemColor ?? "#0f172a";
  const bulletColor = widget.bulletColor ?? widget.itemColor ?? "#0f172a";
  const titleFontFamily = widget.titleFontFamily ?? "var(--font-poppins)";
  const itemFontFamily = widget.itemFontFamily ?? "var(--font-poppins)";
  const titleFontSize = widget.titleFontSize ?? 34;
  const itemFontSize = widget.itemFontSize ?? 22;
  const textAlign = widget.textAlign ?? "left";
  const listType = widget.listType ?? "bullet";
  const backgroundType = widget.backgroundType ?? "solid";

  const toolbar = isSelected ? (
    <ListCardEditingToolbar
      widget={widget}
      isEditing={isEditing}
      widgetRef={widgetRef}
      viewport={viewport}
      containerRef={containerRef}
      activeField={activeField}
    />
  ) : null;

  return (
    <WidgetContainer
      widgetRef={widgetRef}
      isSelected={isSelected}
      isEditing={isEditing}
      widget={widget}
      baseZIndex={baseZIndex}
      onPointerDown={handlePointerDown}
      getResizePointerDown={getResizePointerDown}
      toolbar={toolbar}
    >
      <WidgetBackground
        backgroundType={backgroundType}
        backgroundColor={backgroundColor}
      >
        <div className="flex h-full flex-col gap-4" style={{ textAlign }}>
          {/* Title field - Always visible */}
          <ProseMirrorEditor
            value={localTitle}
            onChange={(value) => {
              if (!isSelected) return;
              setLocalTitle(value);
              debouncedUpdateTitle(value);
            }}
            onFocus={() => {
              if (!isSelected) return;
              setActiveField("title");
            }}
            onBlur={() => {
              debouncedUpdateTitle.flush();
            }}
            placeholder="List Title"
            readOnly={!isSelected}
            className={cn(
              "w-full",
              isSelected ? "cursor-text" : "cursor-default"
            )}
            style={{
              fontSize: `${titleFontSize}px`,
              fontWeight: 700,
              color: titleColor,
              fontFamily: titleFontFamily,
              lineHeight: 1.2,
              textAlign,
              letterSpacing: "-0.01em",
            }}
          />

          {/* List items */}
          <div className="flex flex-col gap-2.5 flex-1 min-h-0 overflow-y-auto">
            {localItems.map((item, index) => (
              <div
                key={index}
                data-list-item
                className="flex items-center gap-4 group/item"
              >
                {/* Bullet/Number - Enhanced styling */}
                <div
                  className="shrink-0 flex items-center justify-center"
                  style={{
                    color: bulletColor,
                    fontFamily: itemFontFamily,
                  }}
                >
                  {listType === "numbered" ? (
                    <div
                      className="flex items-center justify-center rounded-full bg-current/10 text-current"
                      style={{
                        width: `${Math.max(
                          26,
                          Math.round(itemFontSize * 0.9)
                        )}px`,
                        height: `${Math.max(
                          26,
                          Math.round(itemFontSize * 0.9)
                        )}px`,
                      }}
                    >
                      <span
                        className="font-semibold leading-none"
                        style={{
                          fontSize: `${Math.round(itemFontSize * 0.75)}px`,
                        }}
                      >
                        {index + 1}
                      </span>
                    </div>
                  ) : (
                    <div
                      className="flex items-center justify-center rounded-full bg-current"
                      style={{
                        width: `${Math.max(
                          6,
                          Math.round(itemFontSize * 0.35)
                        )}px`,
                        height: `${Math.max(
                          6,
                          Math.round(itemFontSize * 0.35)
                        )}px`,
                      }}
                    />
                  )}
                </div>

                {/* Item input */}
                <div className="flex-1 flex items-center gap-3 min-w-0">
                  <ProseMirrorEditor
                    value={item}
                    onChange={(value) => handleItemChange(index, value)}
                    onFocus={() => {
                      if (!isSelected) return;
                      setEditingIndex(index);
                      setActiveField("item");
                    }}
                    onBlur={() => {
                      debouncedUpdateItems.flush();
                      setEditingIndex(null);
                    }}
                    onKeyDown={(event) => handleItemKeyDown(index, event)}
                    placeholder={`Item ${index + 1}`}
                    readOnly={!isSelected}
                    className={cn(
                      "w-full flex-1",
                      isSelected ? "cursor-text" : "cursor-default"
                    )}
                    style={{
                      fontSize: `${itemFontSize}px`,
                      color: itemColor,
                      fontFamily: itemFontFamily,
                      lineHeight: 1.5,
                      textAlign,
                      fontWeight: 400,
                    }}
                  />

                  {/* Remove button */}
                  {isSelected && localItems.length > 1 && (
                    <button
                      data-remove-item
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveItem(index);
                      }}
                      className="opacity-0 group-hover/item:opacity-100 transition-all duration-200 p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                      title="Remove item"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Add item button */}
            {isSelected && (
              <button
                data-add-item
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddItem();
                }}
                className="flex items-center gap-2.5 text-base text-muted-foreground hover:text-foreground transition-all duration-200 mt-1 opacity-0 group-hover:opacity-100 hover:gap-3"
                title="Add item"
              >
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-dashed border-current/30 hover:border-current/60 transition-colors">
                  <Plus className="h-3.5 w-3.5" />
                </div>
                <span className="font-medium">Add item</span>
              </button>
            )}
          </div>
        </div>
      </WidgetBackground>
    </WidgetContainer>
  );
};

export const ListCardWidgetNode = React.memo(ListCardWidgetNodeBase);

type ListCardEditingToolbarProps = {
  widget: ListWidget;
  isEditing: boolean;
  widgetRef: React.RefObject<HTMLElement | null>;
  viewport: Viewport;
  containerRef: React.RefObject<HTMLElement | null>;
  activeField: ActiveField;
};

const ListCardEditingToolbar: React.FC<ListCardEditingToolbarProps> = ({
  widget,
  isEditing,
  widgetRef,
  viewport,
  containerRef,
  activeField,
}) => {
  const dispatch = useAppDispatch();
  const activeSlideId = useAppSelector(selectActiveSlideId);

  const handleSetBackgroundColor = (color: string) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { backgroundColor: color },
      })
    );
  };

  const handleSetBackgroundType = (type: ListWidget["backgroundType"]) => {
    if (type === (widget.backgroundType ?? "solid")) return;
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { backgroundType: type },
      })
    );
  };

  const handleSetTextColor = (color: string) => {
    if (!activeField) return;

    const colorKey = activeField === "title" ? "titleColor" : "itemColor";

    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { [colorKey]: color },
      })
    );
  };

  const handleSetBulletColor = (color: string) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { bulletColor: color },
      })
    );
  };

  const handleSetFontFamily = (fontFamily: string) => {
    if (!activeField) return;

    const fontKey =
      activeField === "title" ? "titleFontFamily" : "itemFontFamily";

    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { [fontKey]: fontFamily },
      })
    );
  };

  const handleSetFontSize = (size: number) => {
    if (!activeField) return;

    const sizeKey = activeField === "title" ? "titleFontSize" : "itemFontSize";

    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { [sizeKey]: size },
      })
    );
  };

  const handleToggleListType = () => {
    const newListType = widget.listType === "numbered" ? "bullet" : "numbered";
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { listType: newListType },
      })
    );
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
  const currentBackgroundType = widget.backgroundType ?? "glass";
  const currentTextColor =
    activeField === "title"
      ? widget.titleColor ?? "#0f172a"
      : activeField === "item"
      ? widget.itemColor ?? "#0f172a"
      : "#0f172a";
  const currentBulletColor =
    widget.bulletColor ?? widget.itemColor ?? "#0f172a";
  const currentFontFamily =
    activeField === "title"
      ? widget.titleFontFamily ?? "var(--font-poppins)"
      : activeField === "item"
      ? widget.itemFontFamily ?? "var(--font-poppins)"
      : "var(--font-poppins)";

  const currentFontSize =
    activeField === "title"
      ? widget.titleFontSize ?? 34
      : activeField === "item"
      ? widget.itemFontSize ?? 22
      : 22;

  const currentListType = widget.listType ?? "bullet";

  // List type toggle custom control
  const listTypeToggle = (
    <div className="flex items-center gap-1 bg-black/5 rounded-full p-1">
      <Button
        variant="ghost"
        size="icon-sm"
        className={cn(
          "w-7 h-7 rounded-full transition-all duration-200",
          currentListType === "bullet"
            ? "bg-white text-foreground shadow-sm ring-1 ring-black/5"
            : "text-muted-foreground hover:text-foreground hover:bg-black/5"
        )}
        onClick={handleToggleListType}
        title="Bullet List"
      >
        <List className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        className={cn(
          "w-7 h-7 rounded-full transition-all duration-200",
          currentListType === "numbered"
            ? "bg-white text-foreground shadow-sm ring-1 ring-black/5"
            : "text-muted-foreground hover:text-foreground hover:bg-black/5"
        )}
        onClick={handleToggleListType}
        title="Numbered List"
      >
        <ListOrdered className="h-3.5 w-3.5" />
      </Button>
    </div>
  );

  const controls: ToolbarControlConfig[] = [
    // List type toggle (custom)
    {
      type: "custom",
      customRender: () => listTypeToggle,
    },
    // Background color picker
    {
      type: "color-picker",
      config: {
        color: currentBackgroundColor,
        onChange: handleSetBackgroundColor,
        label: "Background Color",
        showReset: true,
        resetValue: "#ffffff",
      },
    },
    // Background type selector
    {
      type: "background-type",
      config: {
        value: currentBackgroundType,
        onChange: handleSetBackgroundType,
      },
    },
    // Text color picker (conditional)
    {
      type: "color-picker",
      config: {
        color: currentTextColor,
        onChange: handleSetTextColor,
        label: activeField ? `${activeField} Color` : "Text Color",
      },
      showWhen: (field) => !!field,
    },
    // Font family selector (conditional)
    {
      type: "font-family",
      config: {
        value: currentFontFamily,
        onChange: handleSetFontFamily,
      },
      showWhen: (field) => !!field,
    },
    // Font size selector (conditional)
    {
      type: "font-size",
      config: {
        value: currentFontSize,
        onChange: handleSetFontSize,
      },
      showWhen: (field) => !!field,
    },
    { type: "separator" },
    // Bullet color picker
    {
      type: "color-picker",
      config: {
        color: currentBulletColor,
        onChange: handleSetBulletColor,
        label: "Bullet Color",
      },
    },
    { type: "separator" },
    // Alignment controls
    {
      type: "alignment",
      config: {
        value: currentAlign,
        onChange: handleAlign,
      },
    },
  ];

  return (
    <WidgetToolbar
      widgetRef={widgetRef}
      viewport={viewport}
      containerRef={containerRef}
      isEditing={isEditing}
      activeField={activeField}
      controls={controls}
      toolbarSelector="data-list-card-toolbar"
    />
  );
};
