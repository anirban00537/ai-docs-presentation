"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import * as Icons from "lucide-react";
import type { ResizeHandle } from "@/components/editor/widgets/types";
import type { IconCardWidget } from "./types";
import {
  TOOLBAR_SELECTOR,
  ICON_CATEGORIES,
  ALL_ICONS,
  ICON_SIZE_OPTIONS,
} from "./constants";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectActiveSlideId,
  updateWidget as updateWidgetAction,
} from "@/store/slices/slidesSlice";
import { useDebouncedCallback } from "use-debounce";
import type { Viewport } from "@/hooks/use-canvas-viewport";
import { Popover } from "@headlessui/react";
import { PopoverPanelPortal } from "@/components/editor/background/popover-panel-portal";
import { Input } from "@/components/ui/input";
import { X, Search as SearchIcon } from "lucide-react";
import { WidgetToolbar } from "@/components/editor/widgets/shared/toolbar-controls/widget-toolbar";
import type { ToolbarControlConfig } from "@/components/editor/widgets/shared/toolbar-controls/types";
import { createPortal } from "react-dom";
import { ProseMirrorEditor } from "@/components/editor/prosemirror-editor";
import {
  WidgetContainer,
  WidgetBackground,
  useWidgetPointerDown,
} from "@/components/editor/widgets/shared";

type IconCardWidgetNodeProps = {
  widget: IconCardWidget;
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

type ActiveField = "title" | "description" | null;

type LucideIcon = React.ComponentType<
  React.SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number }
>;

const IconCardWidgetNodeBase: React.FC<IconCardWidgetNodeProps> = ({
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

  const [localTitle, setLocalTitle] = React.useState(widget.title || "");
  const [localDescription, setLocalDescription] = React.useState(
    widget.description || ""
  );
  const [activeField, setActiveField] = React.useState<ActiveField>(null);
  const [showIconSelector, setShowIconSelector] = React.useState(false);

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
      debouncedUpdateTitle.flush();
      debouncedUpdateDescription.flush();
    };
  }, [debouncedUpdateTitle, debouncedUpdateDescription]);

  // Reset active field when widget is deselected
  React.useEffect(() => {
    if (!isSelected) {
      setActiveField(null);
    }
  }, [isSelected]);

  const iconPointerExclusionSelectors = React.useMemo(
    () => ["[data-icon-selector]", "[data-icon-button]"],
    []
  );

  const handlePointerDown = useWidgetPointerDown({
    onPointerDown,
    toolbarSelector: TOOLBAR_SELECTOR,
    additionalSelectors: iconPointerExclusionSelectors,
  });

  const handleIconClick = React.useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      if (isSelected) {
        setShowIconSelector(true);
      }
    },
    [isSelected]
  );

  const handleSelectIcon = React.useCallback(
    (iconName: string) => {
      dispatch(
        updateWidgetAction({
          slideId: activeSlideId,
          widgetId: widget.id,
          updates: { icon: iconName },
        })
      );
      setShowIconSelector(false);
    },
    [dispatch, activeSlideId, widget.id]
  );

  const activeFieldResetRef = React.useRef<number | null>(null);

  const cancelScheduledReset = React.useCallback(() => {
    if (activeFieldResetRef.current !== null) {
      cancelAnimationFrame(activeFieldResetRef.current);
      activeFieldResetRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    return () => {
      cancelScheduledReset();
    };
  }, [cancelScheduledReset]);

  const handleFieldFocus = React.useCallback(
    (field: ActiveField) => {
      cancelScheduledReset();
      setActiveField(field);
    },
    [cancelScheduledReset]
  );

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

  const handleFieldBlur = React.useCallback(
    (field: ActiveField) => {
      if (field === "title") {
        debouncedUpdateTitle.flush();
      } else if (field === "description") {
        debouncedUpdateDescription.flush();
      }
      scheduleActiveFieldReset();
    },
    [debouncedUpdateTitle, debouncedUpdateDescription, scheduleActiveFieldReset]
  );

  // Widget-local colors and fonts with sensible defaults
  const backgroundColor = widget.backgroundColor ?? "#ffffff";
  const iconColor = widget.iconColor ?? "#0f172a";
  const titleColor = widget.titleColor ?? "#0f172a";
  const descriptionColor = widget.descriptionColor ?? "#475569";
  const iconSize = widget.iconSize ?? 48;
  const titleFontSize = widget.titleFontSize ?? 24;
  const descriptionFontSize = widget.descriptionFontSize ?? 18;
  const titleFontFamily = widget.titleFontFamily ?? "var(--font-poppins)";
  const descriptionFontFamily =
    widget.descriptionFontFamily ?? "var(--font-poppins)";
  const textAlign = widget.textAlign ?? "left";
  const backgroundType = widget.backgroundType ?? "solid";

  // Get the icon component
  const IconComponent = (Icons as unknown as Record<string, LucideIcon>)[
    widget.icon || "Star"
  ];

  const toolbar = isSelected ? (
    <IconCardEditingToolbar
      widget={widget}
      isEditing={isEditing}
      activeField={activeField}
      widgetRef={widgetRef}
      viewport={viewport}
      containerRef={containerRef}
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
          {/* Icon */}
          <div
            className="flex relative"
            style={{
              justifyContent:
                textAlign === "center"
                  ? "center"
                  : textAlign === "right"
                  ? "flex-end"
                  : "flex-start",
            }}
          >
            {IconComponent && (
              <button
                data-icon-button
                onClick={handleIconClick}
                disabled={!isSelected}
                className={cn(
                  "rounded-xl p-2.5 transition-all duration-200 group/icon-btn",
                  isSelected
                    ? "hover:bg-muted/40 cursor-pointer ring-1 ring-transparent hover:ring-primary/30 hover:scale-105"
                    : "cursor-default"
                )}
                title={
                  isSelected
                    ? "Click to change icon"
                    : "Select card to change icon"
                }
              >
                <IconComponent
                  size={iconSize}
                  style={{ color: iconColor }}
                  strokeWidth={2}
                  className="transition-transform duration-200 group-hover/icon-btn:scale-105"
                />
              </button>
            )}

            {/* Icon Selector Modal - Rendered in portal */}
            {showIconSelector && isSelected && (
              <IconSelectorModal
                currentIcon={widget.icon || "Star"}
                onSelectIcon={handleSelectIcon}
                onClose={() => setShowIconSelector(false)}
              />
            )}
          </div>

          {/* Title field */}
          <ProseMirrorEditor
            value={localTitle}
            onChange={(value) => {
              if (!isSelected) return;
              setLocalTitle(value);
              debouncedUpdateTitle(value);
            }}
            onFocus={() => {
              if (!isSelected) return;
              handleFieldFocus("title");
            }}
            onBlur={() => handleFieldBlur("title")}
            placeholder="Feature Title"
            readOnly={!isSelected}
            className={cn(
              "w-full",
              isSelected ? "cursor-text" : "cursor-default"
            )}
            style={{
              fontSize: `${titleFontSize}px`,
              fontWeight: 600,
              color: titleColor,
              fontFamily: titleFontFamily,
              lineHeight: 1.25,
              textAlign,
            }}
          />

          {/* Description field */}
          <ProseMirrorEditor
            value={localDescription}
            onChange={(value) => {
              if (!isSelected) return;
              setLocalDescription(value);
              debouncedUpdateDescription(value);
            }}
            onFocus={() => {
              if (!isSelected) return;
              handleFieldFocus("description");
            }}
            onBlur={() => handleFieldBlur("description")}
            placeholder="Feature description goes here."
            readOnly={!isSelected}
            className={cn(
              "w-full",
              isSelected ? "cursor-text" : "cursor-default"
            )}
            style={{
              fontSize: `${descriptionFontSize}px`,
              color: descriptionColor,
              fontFamily: descriptionFontFamily,
              lineHeight: 1.5,
              wordWrap: "break-word",
              overflowWrap: "break-word",
              minHeight: "3rem",
              textAlign,
            }}
          />
        </div>
      </WidgetBackground>
    </WidgetContainer>
  );
};

export const IconCardWidgetNode = React.memo(IconCardWidgetNodeBase);

type IconCardEditingToolbarProps = {
  widget: IconCardWidget;
  isEditing: boolean;
  activeField: ActiveField;
  widgetRef: React.RefObject<HTMLElement | null>;
  viewport: Viewport;
  containerRef: React.RefObject<HTMLElement | null>;
};

const IconCardEditingToolbar: React.FC<IconCardEditingToolbarProps> = ({
  widget,
  isEditing,
  activeField,
  widgetRef,
  viewport,
  containerRef,
}) => {
  const iconSizeButtonRef = React.useRef<HTMLButtonElement>(null);
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

  const handleSetBackgroundType = (type: IconCardWidget["backgroundType"]) => {
    if (type === (widget.backgroundType ?? "solid")) return;
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { backgroundType: type },
      })
    );
  };

  const handleSetIconColor = (color: string) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { iconColor: color },
      })
    );
  };

  const handleSetTextColor = (color: string) => {
    if (!activeField) return;

    const colorKey =
      activeField === "title" ? "titleColor" : "descriptionColor";

    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { [colorKey]: color },
      })
    );
  };

  const handleSetFontFamily = (fontFamily: string) => {
    if (!activeField) return;

    const fontKey =
      activeField === "title" ? "titleFontFamily" : "descriptionFontFamily";

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

    const sizeKey =
      activeField === "title" ? "titleFontSize" : "descriptionFontSize";

    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { [sizeKey]: size },
      })
    );
  };

  const handleSetIconSize = (size: number) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { iconSize: size },
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
  const currentBackgroundType = widget.backgroundType ?? "solid";
  const currentIconColor = widget.iconColor ?? "#0f172a";

  const currentTextColor =
    activeField === "title"
      ? widget.titleColor ?? "#0f172a"
      : activeField === "description"
      ? widget.descriptionColor ?? "#475569"
      : "#0f172a";

  const currentFontFamily =
    activeField === "title"
      ? widget.titleFontFamily ?? "var(--font-poppins)"
      : activeField === "description"
      ? widget.descriptionFontFamily ?? "var(--font-poppins)"
      : "var(--font-poppins)";

  const currentFontSize =
    activeField === "title"
      ? widget.titleFontSize ?? 24
      : widget.descriptionFontSize ?? 18;

  const currentIconSize = widget.iconSize ?? 48;
  const currentIconSizeLabel =
    ICON_SIZE_OPTIONS.find((option) => option.value === currentIconSize)
      ?.label ?? `${currentIconSize}px`;

  // Icon size selector custom control
  const iconSizeControl = (
    <Popover>
      {({ open }) => (
        <>
          <Popover.Button
            ref={iconSizeButtonRef}
            className={cn(
              "flex items-center gap-1.5 bg-black/5 rounded-full pl-3 pr-2 py-0.5 text-xs font-medium text-muted-foreground/80 transition-colors hover:bg-black/10",
              open && "bg-black/10 text-foreground"
            )}
          >
            <span className="text-[9px] uppercase tracking-widest">Size</span>
            <span className="text-[11px] font-semibold">
              {currentIconSizeLabel}
            </span>
            <ChevronDown className="h-3 w-3" />
          </Popover.Button>
          {open && (
            <PopoverPanelPortal buttonRef={iconSizeButtonRef}>
              <div className="flex flex-col gap-1 p-2 bg-white/95 backdrop-blur-2xl rounded-xl shadow-2xl border border-white/20 min-w-[170px] animate-in fade-in zoom-in-95 duration-150">
                {ICON_SIZE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={cn(
                      "flex items-center justify-between rounded-lg px-3 py-2 text-xs transition-all",
                      option.value === currentIconSize
                        ? "bg-black/5 text-foreground font-semibold"
                        : "text-muted-foreground hover:bg-black/5 hover:text-foreground"
                    )}
                    onClick={() => handleSetIconSize(option.value)}
                  >
                    <span>{option.label}</span>
                    <span className="text-[10px] uppercase">
                      {option.value}px
                    </span>
                  </button>
                ))}
              </div>
            </PopoverPanelPortal>
          )}
        </>
      )}
    </Popover>
  );

  const controls: ToolbarControlConfig[] = [
    // Icon color picker
    {
      type: "color-picker",
      config: {
        color: currentIconColor,
        onChange: handleSetIconColor,
        label: "Icon Color",
      },
    },
    // Icon size selector (custom)
    {
      type: "custom",
      customRender: () => iconSizeControl,
    },
    { type: "separator" },
    // Background color picker
    {
      type: "color-picker",
      config: {
        color: currentBackgroundColor,
        onChange: handleSetBackgroundColor,
        label: "Background",
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
      toolbarSelector="data-icon-card-toolbar"
    />
  );
};

type IconSelectorModalProps = {
  currentIcon: string;
  onSelectIcon: (iconName: string) => void;
  onClose: () => void;
};

const IconSelectorModal: React.FC<IconSelectorModalProps> = ({
  currentIcon,
  onSelectIcon,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] =
    React.useState<string>("Popular");
  const modalRef = React.useRef<HTMLDivElement>(null);

  // Click outside to close
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Filter icons based on search
  const filteredIcons = React.useMemo(() => {
    if (!searchQuery) {
      return (
        ICON_CATEGORIES[selectedCategory as keyof typeof ICON_CATEGORIES] || []
      );
    }
    return ALL_ICONS.filter((icon) =>
      icon.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, selectedCategory]);

  // Render modal in portal to appear above everything
  if (typeof window === "undefined") return null;

  return createPortal(
    <div
      data-icon-selector
      className="fixed inset-0 z-10000 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        className="relative w-[700px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-border/50 animate-in zoom-in-95 duration-200 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Choose an Icon
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Select from {ALL_ICONS.length}+ beautiful icons
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="px-6 pt-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search icons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
              autoFocus
            />
          </div>
        </div>

        {/* Categories */}
        {!searchQuery && (
          <div className="px-6 pt-4">
            <div className="flex flex-wrap gap-2">
              {Object.keys(ICON_CATEGORIES).map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200",
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Icons Grid */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {filteredIcons.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No icons found
              </h3>
              <p className="text-sm text-muted-foreground">
                Try searching with different keywords
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-8 gap-2">
              {filteredIcons.map((iconName) => {
                const IconComp = (
                  Icons as unknown as Record<string, LucideIcon>
                )[iconName];
                if (!IconComp) return null;
                const isSelected = iconName === currentIcon;

                return (
                  <button
                    key={iconName}
                    onClick={() => onSelectIcon(iconName)}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 group",
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20"
                        : "hover:bg-muted/80 text-foreground/70 hover:text-foreground"
                    )}
                    title={iconName}
                  >
                    <IconComp
                      className={cn(
                        "h-6 w-6 transition-transform duration-200",
                        !isSelected && "group-hover:scale-110"
                      )}
                    />
                    <span className="text-[9px] mt-1.5 font-medium truncate w-full text-center">
                      {iconName}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-muted/30">
          <p className="text-xs text-muted-foreground">
            {filteredIcons.length} icon{filteredIcons.length !== 1 ? "s" : ""}{" "}
            available
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-lg"
          >
            Close
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};
