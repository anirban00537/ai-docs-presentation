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
        className="flex-1 rounded-2xl border border-white/5 p-5"
        style={{
          textAlign,
          backgroundColor: "rgba(255, 255, 255, 0.02)",
        }}
      >
        <div className="flex flex-col h-full gap-5">
          <div className="flex items-center justify-between">
            <span
              className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-sm"
              style={{ backgroundColor: accentColor }}
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
                  "w-auto min-w-[60px] text-center text-white uppercase tracking-wide",
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
              lineHeight: 1.2,
            }}
          />

          <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto">
            {items.map((item, index) => (
              <div
                key={`${side}-item-${index}`}
                {...{ [listItemAttr]: true }}
                className="group/item flex items-start gap-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-current/10 text-current transition-all duration-200">
                  <span
                    className="font-semibold"
                    style={{ color: accentColor, fontSize: "0.8rem" }}
                  >
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1 flex items-center gap-3 min-w-0">
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
                    placeholder={`Detail ${index + 1}`}
                    readOnly={!isSelected}
                    className={cn(
                      "w-full flex-1 text-base",
                      isSelected ? "cursor-text" : "cursor-default"
                    )}
                    style={{
                      fontSize: `${itemFontSize}px`,
                      color: textColor,
                      fontFamily: itemFontFamily,
                      lineHeight: 1.5,
                    }}
                  />
                  {isSelected && items.length > 1 && (
                    <button
                      {...{ [removeDataAttr]: true }}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleRemoveItem(side, index);
                      }}
                      className="opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isSelected && (
              <button
                {...{ [addDataAttr]: true }}
                onClick={(event) => {
                  event.stopPropagation();
                  handleAddItem(side);
                }}
                className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-all duration-200 opacity-0 group-hover:opacity-100"
              >
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-current/40"
                  style={{ color: accentColor }}
                >
                  <Plus className="h-3.5 w-3.5" />
                </div>
                <span>Add item</span>
              </button>
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
        <div className="flex h-full w-full gap-6">
          {renderColumn("left")}
          <div
            className="w-px self-stretch rounded-full"
            style={{ backgroundColor: dividerColor }}
          />
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
