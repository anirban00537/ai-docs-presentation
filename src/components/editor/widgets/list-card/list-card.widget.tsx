"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  Sparkles,
  Plus,
  X,
  List,
  ListOrdered,
} from "lucide-react";
import type { ListWidget } from "./types";
import type { ResizeHandle } from "../types";
import { TOOLBAR_SELECTOR, ALIGN_OPTIONS, GOOGLE_FONTS } from "./constants";
import { ResizeHandles } from "@/components/editor/resize-handles";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectActiveSlideId,
  updateWidget as updateWidgetAction,
} from "@/store/slices/slidesSlice";
import { useDebouncedCallback } from "use-debounce";
import type { Viewport } from "@/hooks/use-canvas-viewport";
import { ToolbarPortal } from "@/components/editor/toolbar-portal";
import { Popover } from "@headlessui/react";
import { PopoverPanelPortal } from "@/components/editor/background/popover-panel-portal";
import { HexColorPicker } from "react-colorful";
import { Input } from "@/components/ui/input";

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
  const widgetRef = React.useRef<HTMLDivElement>(null);

  const [localItems, setLocalItems] = React.useState<string[]>(
    widget.items && widget.items.length > 0 ? widget.items : [""]
  );
  const [localTitle, setLocalTitle] = React.useState(widget.title || "");
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);

  const itemInputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

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

  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement;
      // Don't start drag if clicking on toolbar, input, or buttons
      if (
        target.closest(TOOLBAR_SELECTOR) ||
        target.closest("[data-list-item]") ||
        target.closest("[data-add-item]") ||
        target.closest("[data-remove-item]") ||
        target.tagName === "INPUT"
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
    // Focus the new input
    setTimeout(() => {
      const newIndex = newItems.length - 1;
      itemInputRefs.current[newIndex]?.focus();
      setEditingIndex(newIndex);
    }, 0);
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
    (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleAddItem();
      } else if (
        event.key === "Backspace" &&
        localItems[index] === "" &&
        localItems.length > 1
      ) {
        event.preventDefault();
        handleRemoveItem(index);
        // Focus previous item
        if (index > 0) {
          setTimeout(() => {
            itemInputRefs.current[index - 1]?.focus();
          }, 0);
        }
      } else if (event.key === "Escape") {
        event.preventDefault();
        itemInputRefs.current[index]?.blur();
        setEditingIndex(null);
      }
    },
    [localItems, handleAddItem, handleRemoveItem]
  );

  // Widget-local colors and fonts with sensible defaults
  const backgroundColor = widget.backgroundColor ?? "#ffffff";
  const titleColor = widget.titleColor ?? "#0f172a";
  const itemColor = widget.itemColor ?? "#0f172a";
  const bulletColor = widget.bulletColor ?? widget.itemColor ?? "#0f172a";
  const titleFontFamily = widget.titleFontFamily ?? "var(--font-poppins)";
  const itemFontFamily = widget.itemFontFamily ?? "var(--font-poppins)";
  const textAlign = widget.textAlign ?? "left";
  const listType = widget.listType ?? "bullet";
  const backgroundType = widget.backgroundType ?? "solid";
  const isGlassBackground = backgroundType === "glass";

  return (
    <div
      ref={widgetRef}
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
          <ListCardEditingToolbar
            widget={widget}
            isEditing={isEditing}
            widgetRef={widgetRef}
            viewport={viewport}
            containerRef={containerRef}
          />
        )}
        <div
          className={cn(
            "relative h-full w-full rounded-2xl p-5 transition-all duration-300 ease-out",
            isGlassBackground &&
              "backdrop-blur-2xl border border-white/10 shadow-2xl"
          )}
          style={{
            backgroundColor: isGlassBackground
              ? `${backgroundColor}03`
              : backgroundColor,
            backgroundImage: isGlassBackground
              ? "linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.02) 100%)"
              : undefined,
            boxShadow: isGlassBackground
              ? "inset 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 0 rgba(255, 255, 255, 0.25), 0 8px 32px -8px rgba(0, 0, 0, 0.1)"
              : "0 2px 8px -2px rgba(0, 0, 0, 0.08)",
          }}
        >
          <div className="flex h-full flex-col gap-3" style={{ textAlign }}>
            {/* Title field */}
            {widget.title !== undefined && (
              <input
                type="text"
                readOnly={!isSelected}
                className={cn(
                  "w-full resize-none border-none bg-transparent p-0 outline-none focus:ring-0",
                  isSelected ? "cursor-text" : "cursor-default"
                )}
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  color: titleColor,
                  fontFamily: titleFontFamily,
                  lineHeight: 1.3,
                  textAlign,
                }}
                value={localTitle}
                onChange={(e) => {
                  if (!isSelected) return;
                  setLocalTitle(e.target.value);
                  debouncedUpdateTitle(e.target.value);
                }}
                onFocus={() => {
                  if (!isSelected) return;
                }}
                onBlur={() => {
                  debouncedUpdateTitle.flush();
                }}
                placeholder="List Title (optional)"
              />
            )}

            {/* List items */}
            <div className="flex flex-col gap-1.5 flex-1 min-h-0 overflow-y-auto">
              {localItems.map((item, index) => (
                <div
                  key={index}
                  data-list-item
                  className="flex items-start gap-2.5 group/item"
                >
                  {/* Bullet/Number */}
                  <div
                    className="flex-shrink-0 mt-0.5"
                    style={{
                      color: bulletColor,
                      fontFamily: itemFontFamily,
                    }}
                  >
                    {listType === "numbered" ? (
                      <span className="text-sm font-semibold">
                        {index + 1}.
                      </span>
                    ) : (
                      <span className="text-base">•</span>
                    )}
                  </div>

                  {/* Item input */}
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <input
                      ref={(el) => {
                        itemInputRefs.current[index] = el;
                      }}
                      type="text"
                      readOnly={!isSelected}
                      className={cn(
                        "w-full resize-none border-none bg-transparent p-0 outline-none focus:ring-0 flex-1",
                        isSelected ? "cursor-text" : "cursor-default"
                      )}
                      style={{
                        fontSize: "1rem",
                        color: itemColor,
                        fontFamily: itemFontFamily,
                        lineHeight: 1.5,
                        textAlign,
                      }}
                      value={item}
                      onChange={(e) => handleItemChange(index, e.target.value)}
                      onFocus={() => {
                        if (!isSelected) return;
                        setEditingIndex(index);
                      }}
                      onBlur={() => {
                        debouncedUpdateItems.flush();
                        setEditingIndex(null);
                      }}
                      onKeyDown={(e) => handleItemKeyDown(index, e)}
                      placeholder={`Item ${index + 1}`}
                    />

                    {/* Remove button */}
                    {isSelected && localItems.length > 1 && (
                      <button
                        data-remove-item
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveItem(index);
                        }}
                        className="opacity-0 group-hover/item:opacity-100 transition-opacity p-1 rounded hover:bg-muted/50"
                        title="Remove item"
                      >
                        <X className="h-4 w-4 text-muted-foreground" />
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
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mt-2 opacity-0 group-hover:opacity-100"
                  title="Add item"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add item</span>
                </button>
              )}
            </div>
          </div>
        </div>
        {isSelected && !isEditing && (
          <ResizeHandles getResizePointerDown={getResizePointerDown} />
        )}
      </div>
    </div>
  );
};

export const ListCardWidgetNode = React.memo(ListCardWidgetNodeBase);

type ListCardEditingToolbarProps = {
  widget: ListWidget;
  isEditing: boolean;
  widgetRef: React.RefObject<HTMLElement | null>;
  viewport: Viewport;
  containerRef: React.RefObject<HTMLElement | null>;
};

const ListCardEditingToolbar: React.FC<ListCardEditingToolbarProps> = ({
  widget,
  isEditing,
  widgetRef,
  viewport,
  containerRef,
}) => {
  const bgColorPickerButtonRef = React.useRef<HTMLButtonElement>(null);
  const textColorPickerButtonRef = React.useRef<HTMLButtonElement>(null);
  const bulletColorPickerButtonRef = React.useRef<HTMLButtonElement>(null);
  const fontButtonRef = React.useRef<HTMLButtonElement>(null);
  const fontMenuRef = React.useRef<HTMLDivElement>(null);
  const [fontMenuOpen, setFontMenuOpen] = React.useState(false);
  const dispatch = useAppDispatch();
  const activeSlideId = useAppSelector(selectActiveSlideId);

  // Close menus when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        fontMenuOpen &&
        fontMenuRef.current &&
        !fontMenuRef.current.contains(target) &&
        fontButtonRef.current &&
        !fontButtonRef.current.contains(target)
      ) {
        setFontMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [fontMenuOpen]);

  const handleSetBackgroundColor = (color: string) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { backgroundColor: color },
      })
    );
  };

  const handleToggleGlassBackground = () => {
    const newBackgroundType =
      widget.backgroundType === "glass" ? "solid" : "glass";
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { backgroundType: newBackgroundType },
      })
    );
  };

  const handleSetTextColor = (color: string) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { itemColor: color },
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

  const handleSetTitleColor = (color: string) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { titleColor: color },
      })
    );
  };

  const handleSetFontFamily = (fontFamily: string) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { itemFontFamily: fontFamily },
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

  const handleToggleTitle = () => {
    const newTitle = widget.title === undefined ? "" : undefined;
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { title: newTitle },
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
  const currentTextColor = widget.itemColor ?? "#0f172a";
  const currentBulletColor =
    widget.bulletColor ?? widget.itemColor ?? "#0f172a";
  const currentTitleColor = widget.titleColor ?? "#0f172a";
  const currentFontFamily = widget.itemFontFamily ?? "var(--font-poppins)";

  const currentFontLabel =
    GOOGLE_FONTS.find((font) => font.value === currentFontFamily)?.label ??
    "Poppins";

  const currentListType = widget.listType ?? "bullet";

  return (
    <ToolbarPortal
      widgetRef={widgetRef}
      viewport={viewport}
      containerRef={containerRef}
      placement={isEditing ? "bottom" : "top"}
      offset={isEditing ? 12 : 16}
    >
      <div
        data-list-card-toolbar="true"
        className="pointer-events-auto flex items-center gap-3 rounded-full border border-white/20 bg-white/80 px-4 py-2.5 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-all duration-300 hover:bg-white/90 hover:shadow-[0_12px_48px_-12px_rgba(0,0,0,0.25)]"
        onPointerDown={(event) => {
          event.stopPropagation();
        }}
      >
        {/* List Type Toggle */}
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

        <div className="h-5 w-px bg-black/10 rounded-full" />

        {/* Background Section */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center gap-2">
            <Popover>
              {({ open }) => (
                <>
                  <Popover.Button
                    ref={bgColorPickerButtonRef}
                    className="relative w-6 h-6 rounded-full cursor-pointer ring-1 ring-black/5 shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition-all hover:scale-110 hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] focus:outline-none active:scale-95"
                    style={{ backgroundColor: currentBackgroundColor }}
                  >
                    <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/5" />
                    {currentBackgroundColor !== "#ffffff" && (
                      <span
                        className="absolute -top-1 -right-1 flex items-center justify-center w-3.5 h-3.5 bg-neutral-900 text-white rounded-full cursor-pointer opacity-0 group-hover/picker:opacity-100 transition-all shadow-sm scale-75 hover:scale-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetBackgroundColor("#ffffff");
                        }}
                      >
                        <X size={8} strokeWidth={3} />
                      </span>
                    )}
                  </Popover.Button>
                  {open && (
                    <PopoverPanelPortal buttonRef={bgColorPickerButtonRef}>
                      <div className="flex flex-col gap-3 p-3 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/20 animate-in fade-in zoom-in-95 duration-200 min-w-[240px]">
                        <div className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider px-1">
                          Background Color
                        </div>
                        <HexColorPicker
                          color={currentBackgroundColor}
                          onChange={handleSetBackgroundColor}
                          className="w-full! h-32! rounded-xl!"
                        />
                        <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-lg border border-black/5">
                          <div
                            className="w-6 h-6 rounded-full border border-black/10 shadow-sm shrink-0"
                            style={{
                              backgroundColor: currentBackgroundColor,
                            }}
                          />
                          <Input
                            className="h-7 text-xs font-mono border-none bg-transparent focus-visible:ring-0 px-1 uppercase w-full text-muted-foreground"
                            value={currentBackgroundColor}
                            onChange={(e) =>
                              handleSetBackgroundColor(e.target.value)
                            }
                            placeholder="#000000"
                          />
                        </div>
                      </div>
                    </PopoverPanelPortal>
                  )}
                </>
              )}
            </Popover>
            <Button
              variant="ghost"
              size="icon-sm"
              className={cn(
                "w-8 h-8 rounded-full transition-all duration-200",
                widget.backgroundType === "glass"
                  ? "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 shadow-inner"
                  : "hover:bg-black/5 text-muted-foreground"
              )}
              onClick={handleToggleGlassBackground}
              title={
                widget.backgroundType === "glass"
                  ? "Disable Glass Effect"
                  : "Enable Glass Effect"
              }
            >
              <Sparkles className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="h-5 w-px bg-black/10 rounded-full" />

        {/* Text Color Section */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center gap-2">
            <Popover>
              {({ open }) => (
                <>
                  <Popover.Button
                    ref={textColorPickerButtonRef}
                    className="relative w-6 h-6 rounded-full cursor-pointer ring-1 ring-black/5 shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition-all hover:scale-110 hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] focus:outline-none active:scale-95"
                    style={{ backgroundColor: currentTextColor }}
                  >
                    <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/5" />
                  </Popover.Button>
                  {open && (
                    <PopoverPanelPortal buttonRef={textColorPickerButtonRef}>
                      <div className="flex flex-col gap-3 p-3 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/20 animate-in fade-in zoom-in-95 duration-200 min-w-[240px]">
                        <div className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider px-1">
                          Item Text Color
                        </div>
                        <HexColorPicker
                          color={currentTextColor}
                          onChange={handleSetTextColor}
                          className="w-full! h-32! rounded-xl!"
                        />
                        <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-lg border border-black/5">
                          <div
                            className="w-6 h-6 rounded-full border border-black/10 shadow-sm shrink-0"
                            style={{
                              backgroundColor: currentTextColor,
                            }}
                          />
                          <Input
                            className="h-7 text-xs font-mono border-none bg-transparent focus-visible:ring-0 px-1 uppercase w-full text-muted-foreground"
                            value={currentTextColor}
                            onChange={(e) => handleSetTextColor(e.target.value)}
                            placeholder="#000000"
                          />
                        </div>
                      </div>
                    </PopoverPanelPortal>
                  )}
                </>
              )}
            </Popover>
          </div>

          {/* Bullet Color */}
          <div className="relative flex items-center gap-2">
            <Popover>
              {({ open }) => (
                <>
                  <Popover.Button
                    ref={bulletColorPickerButtonRef}
                    className="relative w-6 h-6 rounded-full cursor-pointer ring-1 ring-black/5 shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition-all hover:scale-110 hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] focus:outline-none active:scale-95"
                    style={{ backgroundColor: currentBulletColor }}
                  >
                    <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/5" />
                  </Popover.Button>
                  {open && (
                    <PopoverPanelPortal buttonRef={bulletColorPickerButtonRef}>
                      <div className="flex flex-col gap-3 p-3 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/20 animate-in fade-in zoom-in-95 duration-200 min-w-[240px]">
                        <div className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider px-1">
                          Bullet Color
                        </div>
                        <HexColorPicker
                          color={currentBulletColor}
                          onChange={handleSetBulletColor}
                          className="w-full! h-32! rounded-xl!"
                        />
                        <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-lg border border-black/5">
                          <div
                            className="w-6 h-6 rounded-full border border-black/10 shadow-sm shrink-0"
                            style={{
                              backgroundColor: currentBulletColor,
                            }}
                          />
                          <Input
                            className="h-7 text-xs font-mono border-none bg-transparent focus-visible:ring-0 px-1 uppercase w-full text-muted-foreground"
                            value={currentBulletColor}
                            onChange={(e) =>
                              handleSetBulletColor(e.target.value)
                            }
                            placeholder="#000000"
                          />
                        </div>
                      </div>
                    </PopoverPanelPortal>
                  )}
                </>
              )}
            </Popover>
          </div>

          {/* Font Selector */}
          <div className="relative flex items-center">
            <Button
              ref={fontButtonRef}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 rounded-full bg-black/5 border border-transparent px-3 py-1.5 text-xs hover:bg-black/10 transition-all w-[110px] justify-between group"
              onClick={() => setFontMenuOpen((prev) => !prev)}
            >
              <span className="text-[11px] font-medium text-foreground/80 truncate group-hover:text-foreground">
                {currentFontLabel}
              </span>
              <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </Button>
            {fontMenuOpen && (
              <div
                ref={fontMenuRef}
                className="absolute left-0 top-full mt-2 z-50 min-w-[200px] max-h-[300px] overflow-y-auto rounded-xl border border-white/20 bg-white/90 backdrop-blur-xl p-1.5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="flex flex-col gap-0.5">
                  {GOOGLE_FONTS.map((font) => (
                    <button
                      key={font.value}
                      type="button"
                      className={cn(
                        "flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all duration-200",
                        currentFontFamily === font.value
                          ? "bg-black/5 text-foreground font-medium"
                          : "text-muted-foreground hover:bg-black/5 hover:text-foreground"
                      )}
                      style={{ fontFamily: font.style }}
                      onClick={() => {
                        handleSetFontFamily(font.value);
                        setFontMenuOpen(false);
                      }}
                    >
                      <span>{font.label}</span>
                      {currentFontFamily === font.value && (
                        <span className="text-blue-600 text-xs">●</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="h-5 w-px bg-black/10 rounded-full" />

        {/* Alignment Section */}
        <div className="flex items-center gap-1 bg-black/5 rounded-full p-1">
          {ALIGN_OPTIONS.map(({ value, icon: Icon, label }) => (
            <Button
              key={value}
              variant="ghost"
              size="icon-sm"
              className={cn(
                "w-7 h-7 rounded-full transition-all duration-200",
                currentAlign === value
                  ? "bg-white text-foreground shadow-sm ring-1 ring-black/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-black/5"
              )}
              onClick={() => handleAlign(value)}
              aria-pressed={currentAlign === value}
              title={label}
            >
              <Icon className="h-3.5 w-3.5" />
            </Button>
          ))}
        </div>
      </div>
    </ToolbarPortal>
  );
};
