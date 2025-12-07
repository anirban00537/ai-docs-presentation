"use client";

import React from "react";
import { useDebouncedCallback } from "use-debounce";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComparisonCardWidget } from "./types";
import type { ResizeHandle } from "../types";
import type { Viewport } from "@/hooks/use-canvas-viewport";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectActiveSlideId,
  updateWidget as updateWidgetAction,
} from "@/store/slices/slidesSlice";
import type { GlobalTheme } from "@/store/slices/slidesSlice";
import {
  WidgetBackground,
  WidgetContainer,
  useWidgetPointerDown,
} from "@/components/editor/widgets/shared";
import { WidgetToolbar } from "@/components/editor/widgets/shared/toolbar-controls/widget-toolbar";
import type { ToolbarControlConfig } from "@/components/editor/widgets/shared/toolbar-controls/types";
import { ProseMirrorEditor } from "@/components/editor/prosemirror-editor";
import { TOOLBAR_SELECTOR } from "./constants";

type ActiveField =
  | "leftLabel"
  | "leftTitle"
  | "leftItem"
  | "rightLabel"
  | "rightTitle"
  | "rightItem"
  | null;

type ColumnSide = "left" | "right";

type ComparisonCardWidgetNodeProps = {
  widget: ComparisonCardWidget;
  isSelected: boolean;
  isEditing: boolean;
  baseZIndex: number;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  getResizePointerDown: (
    handle: ResizeHandle
  ) => (event: React.PointerEvent<HTMLDivElement>) => void;
  viewport: Viewport;
  containerRef: React.RefObject<HTMLElement | null>;
  globalTheme?: GlobalTheme; // Use globalTheme from props, not from Redux state
};

const ComparisonCardWidgetNodeBase: React.FC<ComparisonCardWidgetNodeProps> = ({
  widget,
  isSelected,
  isEditing,
  baseZIndex,
  onPointerDown,
  getResizePointerDown,
  viewport,
  containerRef,
  globalTheme,
}) => {
  const dispatch = useAppDispatch();
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const widgetRef = React.useRef<HTMLDivElement | null>(null);
  const [activeField, setActiveField] = React.useState<ActiveField>(null);

  const [localLeftTitle, setLocalLeftTitle] = React.useState(
    widget.leftTitle ?? "Plan A"
  );
  const [localRightTitle, setLocalRightTitle] = React.useState(
    widget.rightTitle ?? "Plan B"
  );
  const [localLeftLabel, setLocalLeftLabel] = React.useState(
    widget.leftLabel ?? "Plan A"
  );
  const [localRightLabel, setLocalRightLabel] = React.useState(
    widget.rightLabel ?? "Plan B"
  );
  const [localLeftItems, setLocalLeftItems] = React.useState<string[]>(
    widget.leftItems && widget.leftItems.length > 0
      ? widget.leftItems
      : ["Feature one", "Feature two"]
  );
  const [localRightItems, setLocalRightItems] = React.useState<string[]>(
    widget.rightItems && widget.rightItems.length > 0
      ? widget.rightItems
      : ["Competitor item one", "Competitor item two"]
  );

  const debouncedUpdateLeftTitle = useDebouncedCallback((value: string) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { leftTitle: value },
      })
    );
  }, 250);

  const debouncedUpdateLeftLabel = useDebouncedCallback((value: string) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { leftLabel: value },
      })
    );
  }, 250);

  const debouncedUpdateRightTitle = useDebouncedCallback((value: string) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { rightTitle: value },
      })
    );
  }, 250);

  const debouncedUpdateRightLabel = useDebouncedCallback((value: string) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { rightLabel: value },
      })
    );
  }, 250);

  const debouncedUpdateLeftItems = useDebouncedCallback((items: string[]) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { leftItems: items },
      })
    );
  }, 250);

  const debouncedUpdateRightItems = useDebouncedCallback((items: string[]) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { rightItems: items },
      })
    );
  }, 250);

  React.useEffect(() => {
    setLocalLeftTitle((prev) =>
      prev === widget.leftTitle ? prev : widget.leftTitle ?? "Plan A"
    );
  }, [widget.leftTitle]);

  React.useEffect(() => {
    setLocalLeftLabel((prev) =>
      prev === widget.leftLabel ? prev : widget.leftLabel ?? "Plan A"
    );
  }, [widget.leftLabel]);

  React.useEffect(() => {
    setLocalRightTitle((prev) =>
      prev === widget.rightTitle ? prev : widget.rightTitle ?? "Plan B"
    );
  }, [widget.rightTitle]);

  React.useEffect(() => {
    setLocalRightLabel((prev) =>
      prev === widget.rightLabel ? prev : widget.rightLabel ?? "Plan B"
    );
  }, [widget.rightLabel]);

  React.useEffect(() => {
    setLocalLeftItems((prev) => {
      const items =
        widget.leftItems && widget.leftItems.length > 0
          ? widget.leftItems
          : ["Feature one", "Feature two"];
      if (JSON.stringify(prev) === JSON.stringify(items)) {
        return prev;
      }
      return items;
    });
  }, [widget.leftItems]);

  React.useEffect(() => {
    setLocalRightItems((prev) => {
      const items =
        widget.rightItems && widget.rightItems.length > 0
          ? widget.rightItems
          : ["Competitor item one", "Competitor item two"];
      if (JSON.stringify(prev) === JSON.stringify(items)) {
        return prev;
      }
      return items;
    });
  }, [widget.rightItems]);

  React.useEffect(() => {
    return () => {
      debouncedUpdateLeftLabel.flush();
      debouncedUpdateRightLabel.flush();
      debouncedUpdateLeftTitle.flush();
      debouncedUpdateRightTitle.flush();
      debouncedUpdateLeftItems.flush();
      debouncedUpdateRightItems.flush();
    };
  }, [
    debouncedUpdateLeftLabel,
    debouncedUpdateRightLabel,
    debouncedUpdateLeftTitle,
    debouncedUpdateRightTitle,
    debouncedUpdateLeftItems,
    debouncedUpdateRightItems,
  ]);

  const activeFieldResetRef = React.useRef<number | null>(null);

  const cancelScheduledReset = React.useCallback(() => {
    if (activeFieldResetRef.current !== null) {
      cancelAnimationFrame(activeFieldResetRef.current);
      activeFieldResetRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    if (!isSelected) {
      setActiveField(null);
    }
  }, [isSelected]);

  React.useEffect(() => {
    return () => cancelScheduledReset();
  }, [cancelScheduledReset]);

  const scheduleActiveFieldReset = React.useCallback(() => {
    if (typeof window === "undefined") {
      setActiveField(null);
      return;
    }

    cancelScheduledReset();
    activeFieldResetRef.current = window.requestAnimationFrame(() => {
      activeFieldResetRef.current = null;
      const activeElement = document.activeElement as HTMLElement | null;
      if (
        activeElement &&
        (activeElement.closest(TOOLBAR_SELECTOR) ||
          activeElement.closest('[data-widget-toolbar="true"]'))
      ) {
        return;
      }
      setActiveField(null);
    });
  }, [cancelScheduledReset]);

  const handleFieldFocus = React.useCallback(
    (field: ActiveField) => {
      cancelScheduledReset();
      setActiveField(field);
    },
    [cancelScheduledReset]
  );

  const comparisonPointerSelectors = React.useMemo(
    () => [
      "[data-left-add-item]",
      "[data-left-remove-item]",
      "[data-right-add-item]",
      "[data-right-remove-item]",
    ],
    []
  );

  const handlePointerDown = useWidgetPointerDown({
    onPointerDown,
    toolbarSelector: TOOLBAR_SELECTOR,
    additionalSelectors: comparisonPointerSelectors,
  });

  const backgroundColor = widget.backgroundColor ?? undefined;
  const backgroundType = widget.backgroundType ?? "glass";
  const dividerColor = widget.dividerColor ?? "rgba(15,23,42,0.12)";
  const textAlign = widget.textAlign ?? "left";

  const leftAccentColor =
    widget.leftAccentColor ?? globalTheme?.accent ?? "#2563eb";
  const rightAccentColor =
    widget.rightAccentColor ?? globalTheme?.accent ?? "#f97316";
  const leftTextColor = widget.leftTextColor ?? globalTheme?.text ?? "#0f172a";
  const rightTextColor =
    widget.rightTextColor ?? globalTheme?.text ?? "#0f172a";

  const leftTitleFontFamily =
    widget.leftTitleFontFamily ?? globalTheme?.font ?? "var(--font-poppins)";
  const rightTitleFontFamily =
    widget.rightTitleFontFamily ?? globalTheme?.font ?? "var(--font-poppins)";
  const leftLabelFontFamily =
    widget.leftLabelFontFamily ?? globalTheme?.font ?? "var(--font-poppins)";
  const rightLabelFontFamily =
    widget.rightLabelFontFamily ?? globalTheme?.font ?? "var(--font-poppins)";
  const leftItemFontFamily =
    widget.leftItemFontFamily ?? globalTheme?.font ?? "var(--font-poppins)";
  const rightItemFontFamily =
    widget.rightItemFontFamily ?? globalTheme?.font ?? "var(--font-poppins)";

  const leftLabelFontSize = widget.leftLabelFontSize ?? 13;
  const rightLabelFontSize = widget.rightLabelFontSize ?? 13;
  const leftTitleFontSize = widget.leftTitleFontSize ?? 30;
  const rightTitleFontSize = widget.rightTitleFontSize ?? 30;
  const leftItemFontSize = widget.leftItemFontSize ?? 18;
  const rightItemFontSize = widget.rightItemFontSize ?? 18;

  const handleTitleChange = React.useCallback(
    (side: ColumnSide, value: string) => {
      if (!isSelected) return;
      if (side === "left") {
        setLocalLeftTitle(value);
        debouncedUpdateLeftTitle(value);
      } else {
        setLocalRightTitle(value);
        debouncedUpdateRightTitle(value);
      }
    },
    [isSelected, debouncedUpdateLeftTitle, debouncedUpdateRightTitle]
  );

  const handleItemsChange = React.useCallback(
    (side: ColumnSide, index: number, value: string) => {
      if (!isSelected) return;
      if (side === "left") {
        const next = [...localLeftItems];
        next[index] = value;
        setLocalLeftItems(next);
        debouncedUpdateLeftItems(next);
      } else {
        const next = [...localRightItems];
        next[index] = value;
        setLocalRightItems(next);
        debouncedUpdateRightItems(next);
      }
    },
    [
      isSelected,
      localLeftItems,
      localRightItems,
      debouncedUpdateLeftItems,
      debouncedUpdateRightItems,
    ]
  );

  const handleAddItem = React.useCallback(
    (side: ColumnSide) => {
      if (!isSelected) return;
      if (side === "left") {
        const next = [...localLeftItems, ""];
        setLocalLeftItems(next);
        debouncedUpdateLeftItems(next);
      } else {
        const next = [...localRightItems, ""];
        setLocalRightItems(next);
        debouncedUpdateRightItems(next);
      }
    },
    [
      isSelected,
      localLeftItems,
      localRightItems,
      debouncedUpdateLeftItems,
      debouncedUpdateRightItems,
    ]
  );

  const handleRemoveItem = React.useCallback(
    (side: ColumnSide, index: number) => {
      if (!isSelected) return;
      if (side === "left") {
        if (localLeftItems.length <= 1) return;
        const next = localLeftItems.filter((_, i) => i !== index);
        setLocalLeftItems(next);
        debouncedUpdateLeftItems(next);
      } else {
        if (localRightItems.length <= 1) return;
        const next = localRightItems.filter((_, i) => i !== index);
        setLocalRightItems(next);
        debouncedUpdateRightItems(next);
      }
    },
    [
      isSelected,
      localLeftItems,
      localRightItems,
      debouncedUpdateLeftItems,
      debouncedUpdateRightItems,
    ]
  );

  const handleItemKeyDown = React.useCallback(
    (side: ColumnSide, index: number, event: KeyboardEvent) => {
      if (!isSelected) return;
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleAddItem(side);
        return;
      }
      if (
        event.key === "Backspace" &&
        (side === "left" ? localLeftItems : localRightItems)[index] === "" &&
        index > 0
      ) {
        event.preventDefault();
        handleRemoveItem(side, index);
      }
    },
    [
      handleAddItem,
      handleRemoveItem,
      isSelected,
      localLeftItems,
      localRightItems,
    ]
  );

  const toolbar = isSelected ? (
    <ComparisonCardEditingToolbar
      widget={widget}
      isEditing={isEditing}
      widgetRef={widgetRef}
      viewport={viewport}
      containerRef={containerRef}
      activeField={activeField}
      globalTheme={globalTheme}
    />
  ) : null;

  const renderColumn = (side: ColumnSide) => {
    const isLeft = side === "left";
    const title = isLeft ? localLeftTitle : localRightTitle;
    const items = isLeft ? localLeftItems : localRightItems;
    const label = isLeft ? localLeftLabel : localRightLabel;
    const accentColor = isLeft ? leftAccentColor : rightAccentColor;
    const textColor = isLeft ? leftTextColor : rightTextColor;
    const labelFontFamily = isLeft ? leftLabelFontFamily : rightLabelFontFamily;
    const titleFontFamily = isLeft ? leftTitleFontFamily : rightTitleFontFamily;
    const itemFontFamily = isLeft ? leftItemFontFamily : rightItemFontFamily;
    const labelFontSize = isLeft ? leftLabelFontSize : rightLabelFontSize;
    const titleFontSize = isLeft ? leftTitleFontSize : rightTitleFontSize;
    const itemFontSize = isLeft ? leftItemFontSize : rightItemFontSize;
    const labelField: ActiveField = isLeft ? "leftLabel" : "rightLabel";
    const titleField: ActiveField = isLeft ? "leftTitle" : "rightTitle";
    const itemField: ActiveField = isLeft ? "leftItem" : "rightItem";
    const addDataAttr = isLeft ? "data-left-add-item" : "data-right-add-item";
    const removeDataAttr = isLeft
      ? "data-left-remove-item"
      : "data-right-remove-item";
    const listItemAttr = isLeft
      ? "data-left-list-item"
      : "data-right-list-item";

    return (
      <div
        className="flex-1 rounded-2xl p-6 relative overflow-hidden transition-all duration-300"
        style={{
          textAlign,
          background: `linear-gradient(135deg, ${accentColor}08 0%, ${accentColor}03 100%)`,
          border: `1px solid ${accentColor}15`,
        }}
      >
        {/* Subtle gradient accent line at top */}
        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
          style={{
            background: `linear-gradient(90deg, ${accentColor} 0%, ${accentColor}60 100%)`,
          }}
        />
        
        <div className="flex flex-col h-full gap-4">
          {/* Label badge */}
          <div className="flex items-center">
            <span
              className="inline-flex items-center rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg"
              style={{ 
                background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}cc 100%)`,
                boxShadow: `0 4px 14px ${accentColor}40`,
              }}
            >
              <ProseMirrorEditor
                value={label}
                onChange={(value) => {
                  if (!isSelected) return;
                  if (isLeft) {
                    setLocalLeftLabel(value);
                    debouncedUpdateLeftLabel(value);
                  } else {
                    setLocalRightLabel(value);
                    debouncedUpdateRightLabel(value);
                  }
                }}
                onFocus={() => {
                  if (!isSelected) return;
                  handleFieldFocus(labelField);
                }}
                onBlur={() => {
                  if (isLeft) {
                    debouncedUpdateLeftLabel.flush();
                  } else {
                    debouncedUpdateRightLabel.flush();
                  }
                  scheduleActiveFieldReset();
                }}
                placeholder={isLeft ? "Plan A" : "Plan B"}
                readOnly={!isSelected}
                className={cn(
                  "w-auto min-w-[50px] text-center text-white uppercase tracking-wider",
                  isSelected ? "cursor-text" : "cursor-default"
                )}
                style={{
                  color: "#ffffff",
                  fontFamily: labelFontFamily,
                  fontSize: `${labelFontSize}px`,
                  lineHeight: 1.1,
                  textAlign: "center",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />
            </span>
          </div>

          {/* Title */}
          <div className="mt-1">
            <ProseMirrorEditor
              value={title}
              onChange={(value) => handleTitleChange(side, value)}
              onFocus={() => {
                if (!isSelected) return;
                handleFieldFocus(titleField);
              }}
              onBlur={() => {
                if (side === "left") {
                  debouncedUpdateLeftTitle.flush();
                } else {
                  debouncedUpdateRightTitle.flush();
                }
                scheduleActiveFieldReset();
              }}
              placeholder={isLeft ? "Plan A title" : "Plan B title"}
              readOnly={!isSelected}
              className={cn(
                "w-full",
                isSelected ? "cursor-text" : "cursor-default"
              )}
              style={{
                fontSize: `${titleFontSize}px`,
                fontWeight: 700,
                color: textColor,
                fontFamily: titleFontFamily,
                lineHeight: 1.25,
                letterSpacing: "-0.02em",
              }}
            />
          </div>

          {/* Items list */}
          <div className="flex flex-col gap-3 flex-1 min-h-0 mt-2" style={{ textAlign }}>
            {items.map((item, index) => {
              const isRightAligned = textAlign === "right";
              const isCenterAligned = textAlign === "center";
              
              const numberBadge = (
                <div 
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200"
                  style={{ 
                    backgroundColor: `${accentColor}15`,
                  }}
                >
                  <span
                    className="font-bold text-sm"
                    style={{ color: accentColor }}
                  >
                    {index + 1}
                  </span>
                </div>
              );
              
              const itemContent = (
                <div 
                  className="flex-1 flex items-center gap-2 min-w-0 pt-0.5"
                  style={{ textAlign }}
                >
                  <ProseMirrorEditor
                    value={item}
                    onChange={(value) => handleItemsChange(side, index, value)}
                    onFocus={() => {
                      if (!isSelected) return;
                      handleFieldFocus(itemField);
                    }}
                    onBlur={() => {
                      if (side === "left") {
                        debouncedUpdateLeftItems.flush();
                      } else {
                        debouncedUpdateRightItems.flush();
                      }
                      scheduleActiveFieldReset();
                    }}
                    onKeyDown={(event) => handleItemKeyDown(side, index, event)}
                    placeholder={`Feature ${index + 1}`}
                    readOnly={!isSelected}
                    className={cn(
                      "w-full flex-1",
                      isSelected ? "cursor-text" : "cursor-default"
                    )}
                    style={{
                      fontSize: `${itemFontSize}px`,
                      color: textColor,
                      fontFamily: itemFontFamily,
                      lineHeight: 1.5,
                      opacity: 0.9,
                      textAlign,
                    }}
                  />
                </div>
              );
              
              const removeButton = isSelected && items.length > 1 && (
                <button
                  {...{ [removeDataAttr]: true }}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleRemoveItem(side, index);
                  }}
                  className="opacity-0 group-hover/item:opacity-100 transition-all duration-200 p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              );
              
              return (
                <div
                  key={`${side}-item-${index}`}
                  {...{ [listItemAttr]: true }}
                  className={cn(
                    "group/item flex items-center gap-3 p-2 -mx-2 rounded-xl transition-all duration-200 hover:bg-black/[0.02]",
                    isRightAligned && "flex-row-reverse",
                    isCenterAligned && "justify-center"
                  )}
                  style={{ textAlign }}
                >
                  {numberBadge}
                  {itemContent}
                  {removeButton}
                </div>
              );
            })}

            {/* Add item button - aligned with items */}
            {isSelected && (
              <div 
                className={cn(
                  "flex items-center gap-3 p-2 -mx-2",
                  textAlign === "right" && "flex-row-reverse",
                  textAlign === "center" && "justify-center"
                )}
                style={{ textAlign }}
              >
                <button
                  {...{ [addDataAttr]: true }}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleAddItem(side);
                  }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-dashed transition-all duration-200 hover:border-solid opacity-50 hover:opacity-100"
                  style={{ 
                    borderColor: accentColor,
                    color: accentColor,
                  }}
                >
                  <Plus className="h-4 w-4" />
                </button>
                <span 
                  className="text-sm font-medium opacity-0 group-hover:opacity-60 transition-opacity duration-200"
                  style={{ color: textColor }}
                >
                  Add item
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

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
        <div className="flex h-full w-full gap-4 p-2">
          {renderColumn("left")}
          {/* Vertical divider with gradient */}
          <div className="flex flex-col items-center justify-center py-8">
            <div
              className="w-px flex-1 rounded-full"
              style={{ 
                background: `linear-gradient(180deg, transparent 0%, ${dividerColor} 20%, ${dividerColor} 80%, transparent 100%)`,
              }}
            />
          </div>
          {renderColumn("right")}
        </div>
      </WidgetBackground>
    </WidgetContainer>
  );
};

type ComparisonCardEditingToolbarProps = {
  widget: ComparisonCardWidget;
  isEditing: boolean;
  widgetRef: React.RefObject<HTMLElement | null>;
  viewport: Viewport;
  containerRef: React.RefObject<HTMLElement | null>;
  activeField: ActiveField;
  globalTheme?: GlobalTheme; // Use globalTheme from props, not from Redux state
};

const ComparisonCardEditingToolbar: React.FC<
  ComparisonCardEditingToolbarProps
> = ({
  widget,
  isEditing,
  widgetRef,
  viewport,
  containerRef,
  activeField,
  globalTheme,
}) => {
  const dispatch = useAppDispatch();
  const activeSlideId = useAppSelector(selectActiveSlideId);

  const isLeftTextField =
    activeField === "leftTitle" || activeField === "leftItem";
  const isRightTextField =
    activeField === "rightTitle" || activeField === "rightItem";

  const handleUpdate = React.useCallback(
    (updates: Partial<ComparisonCardWidget>) => {
      dispatch(
        updateWidgetAction({
          slideId: activeSlideId,
          widgetId: widget.id,
          updates,
        })
      );
    },
    [dispatch, activeSlideId, widget.id]
  );

  const handleFontFamilyChange = React.useCallback(
    (fontFamily: string) => {
      if (activeField === "leftLabel") {
        handleUpdate({ leftLabelFontFamily: fontFamily });
      } else if (activeField === "leftTitle") {
        handleUpdate({ leftTitleFontFamily: fontFamily });
      } else if (activeField === "leftItem") {
        handleUpdate({ leftItemFontFamily: fontFamily });
      } else if (activeField === "rightLabel") {
        handleUpdate({ rightLabelFontFamily: fontFamily });
      } else if (activeField === "rightTitle") {
        handleUpdate({ rightTitleFontFamily: fontFamily });
      } else if (activeField === "rightItem") {
        handleUpdate({ rightItemFontFamily: fontFamily });
      }
    },
    [activeField, handleUpdate]
  );

  const handleFontSizeChange = React.useCallback(
    (size: number) => {
      if (activeField === "leftLabel") {
        handleUpdate({ leftLabelFontSize: size });
      } else if (activeField === "leftTitle") {
        handleUpdate({ leftTitleFontSize: size });
      } else if (activeField === "leftItem") {
        handleUpdate({ leftItemFontSize: size });
      } else if (activeField === "rightLabel") {
        handleUpdate({ rightLabelFontSize: size });
      } else if (activeField === "rightTitle") {
        handleUpdate({ rightTitleFontSize: size });
      } else if (activeField === "rightItem") {
        handleUpdate({ rightItemFontSize: size });
      }
    },
    [activeField, handleUpdate]
  );

  const currentFontFamily = React.useMemo(() => {
    switch (activeField) {
      case "leftLabel":
        return (
          widget.leftLabelFontFamily ??
          globalTheme?.font ??
          "var(--font-poppins)"
        );
      case "leftTitle":
        return (
          widget.leftTitleFontFamily ??
          globalTheme?.font ??
          "var(--font-poppins)"
        );
      case "leftItem":
        return (
          widget.leftItemFontFamily ??
          globalTheme?.font ??
          "var(--font-poppins)"
        );
      case "rightLabel":
        return (
          widget.rightLabelFontFamily ??
          globalTheme?.font ??
          "var(--font-poppins)"
        );
      case "rightTitle":
        return (
          widget.rightTitleFontFamily ??
          globalTheme?.font ??
          "var(--font-poppins)"
        );
      case "rightItem":
        return (
          widget.rightItemFontFamily ??
          globalTheme?.font ??
          "var(--font-poppins)"
        );
      default:
        return globalTheme?.font ?? "var(--font-poppins)";
    }
  }, [
    activeField,
    widget.leftLabelFontFamily,
    widget.leftTitleFontFamily,
    widget.leftItemFontFamily,
    widget.rightLabelFontFamily,
    widget.rightTitleFontFamily,
    widget.rightItemFontFamily,
    globalTheme?.font,
  ]);

  const currentFontSize = React.useMemo(() => {
    switch (activeField) {
      case "leftLabel":
        return widget.leftLabelFontSize ?? 13;
      case "leftTitle":
        return widget.leftTitleFontSize ?? 30;
      case "leftItem":
        return widget.leftItemFontSize ?? 18;
      case "rightLabel":
        return widget.rightLabelFontSize ?? 13;
      case "rightTitle":
        return widget.rightTitleFontSize ?? 30;
      case "rightItem":
        return widget.rightItemFontSize ?? 18;
      default:
        return 18;
    }
  }, [
    activeField,
    widget.leftLabelFontSize,
    widget.leftTitleFontSize,
    widget.leftItemFontSize,
    widget.rightLabelFontSize,
    widget.rightTitleFontSize,
    widget.rightItemFontSize,
  ]);

  const controls: ToolbarControlConfig[] = [
    {
      type: "color-picker",
      config: {
        color:
          widget.backgroundColor ??
          globalTheme?.surface ??
          "rgba(15,23,42,0.05)",
        onChange: (color: string) => handleUpdate({ backgroundColor: color }),
        label: "Surface",
      },
    },
    {
      type: "background-type",
      config: {
        value: widget.backgroundType ?? "glass",
        onChange: (
          value: NonNullable<ComparisonCardWidget["backgroundType"]>
        ) => handleUpdate({ backgroundType: value }),
      },
    },
    { type: "separator" },
    {
      type: "color-picker",
      config: {
        color: widget.leftAccentColor ?? globalTheme?.accent ?? "#2563eb",
        onChange: (color: string) => handleUpdate({ leftAccentColor: color }),
        label: "Plan A accent",
      },
    },
    {
      type: "color-picker",
      config: {
        color: widget.rightAccentColor ?? globalTheme?.accent ?? "#f97316",
        onChange: (color: string) => handleUpdate({ rightAccentColor: color }),
        label: "Plan B accent",
      },
    },
    {
      type: "color-picker",
      showWhen: () => isLeftTextField,
      config: {
        color: widget.leftTextColor ?? globalTheme?.text ?? "#0f172a",
        onChange: (color: string) => handleUpdate({ leftTextColor: color }),
        label: "Text color",
      },
    },
    {
      type: "color-picker",
      showWhen: () => isRightTextField,
      config: {
        color: widget.rightTextColor ?? globalTheme?.text ?? "#0f172a",
        onChange: (color: string) => handleUpdate({ rightTextColor: color }),
        label: "Text color",
      },
    },
    {
      type: "font-family",
      showWhen: () => activeField !== null,
      config: {
        value: currentFontFamily,
        onChange: handleFontFamilyChange,
      },
    },
    {
      type: "font-size",
      showWhen: () => activeField !== null,
      config: {
        value: currentFontSize,
        onChange: handleFontSizeChange,
      },
    },
    {
      type: "alignment",
      config: {
        value: widget.textAlign ?? "left",
        onChange: (align: NonNullable<ComparisonCardWidget["textAlign"]>) =>
          handleUpdate({ textAlign: align }),
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
      toolbarSelector="data-comparison-card-toolbar"
    />
  );
};

export const ComparisonCardWidgetNode = React.memo(
  ComparisonCardWidgetNodeBase
);
