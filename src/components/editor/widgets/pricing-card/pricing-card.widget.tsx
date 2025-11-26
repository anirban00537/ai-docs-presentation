"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { ResizeHandle } from "@/components/editor/widgets/types";
import type { PricingCardWidget } from "./types";
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
import { Check, Plus, X } from "lucide-react";

type PricingCardWidgetNodeProps = {
  widget: PricingCardWidget;
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

type ActiveField =
  | "planName"
  | "price"
  | "period"
  | "badge"
  | "buttonText"
  | "feature"
  | null;

const PricingCardWidgetNodeBase: React.FC<PricingCardWidgetNodeProps> = ({
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

  const [localPlanName, setLocalPlanName] = React.useState(
    widget.planName || "Plan Name"
  );
  const [localPrice, setLocalPrice] = React.useState(widget.price || "$0");
  const [localPeriod, setLocalPeriod] = React.useState(widget.period || "/mo");
  const [localBadge, setLocalBadge] = React.useState(widget.badge || "");
  const [localFeatures, setLocalFeatures] = React.useState<string[]>(
    widget.features && widget.features.length > 0 ? widget.features : [""]
  );
  const [localButtonText, setLocalButtonText] = React.useState(
    widget.buttonText || "Get Started"
  );
  const [activeField, setActiveField] = React.useState<ActiveField>(null);
  const [activeFeatureIndex, setActiveFeatureIndex] = React.useState<number | null>(null);

  const debouncedUpdatePlanName = useDebouncedCallback((value: string) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { planName: value },
      })
    );
  }, 250);

  const debouncedUpdatePrice = useDebouncedCallback((value: string) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { price: value },
      })
    );
  }, 250);

  const debouncedUpdatePeriod = useDebouncedCallback((value: string) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { period: value },
      })
    );
  }, 250);

  const debouncedUpdateBadge = useDebouncedCallback((value: string) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { badge: value },
      })
    );
  }, 250);

  const debouncedUpdateFeatures = useDebouncedCallback((features: string[]) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { features },
      })
    );
  }, 250);

  const debouncedUpdateButtonText = useDebouncedCallback((value: string) => {
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { buttonText: value },
      })
    );
  }, 250);

  React.useEffect(() => {
    setLocalPlanName((prev) =>
      prev === widget.planName ? prev : widget.planName || "Plan Name"
    );
  }, [widget.planName]);

  React.useEffect(() => {
    setLocalPrice((prev) => (prev === widget.price ? prev : widget.price || "$0"));
  }, [widget.price]);

  React.useEffect(() => {
    setLocalPeriod((prev) => (prev === widget.period ? prev : widget.period || "/mo"));
  }, [widget.period]);

  React.useEffect(() => {
    setLocalBadge((prev) => (prev === widget.badge ? prev : widget.badge || ""));
  }, [widget.badge]);

  React.useEffect(() => {
    setLocalFeatures((prev) =>
      prev.length === widget.features?.length &&
      prev.every((item, i) => item === widget.features?.[i])
        ? prev
        : widget.features && widget.features.length > 0
        ? widget.features
        : [""]
    );
  }, [widget.features]);

  React.useEffect(() => {
    setLocalButtonText((prev) =>
      prev === widget.buttonText ? prev : widget.buttonText || "Get Started"
    );
  }, [widget.buttonText]);

  React.useEffect(() => {
    return () => {
      debouncedUpdatePlanName.flush();
      debouncedUpdatePrice.flush();
      debouncedUpdatePeriod.flush();
      debouncedUpdateBadge.flush();
      debouncedUpdateFeatures.flush();
      debouncedUpdateButtonText.flush();
    };
  }, [
    debouncedUpdatePlanName,
    debouncedUpdatePrice,
    debouncedUpdatePeriod,
    debouncedUpdateBadge,
    debouncedUpdateFeatures,
    debouncedUpdateButtonText,
  ]);

  React.useEffect(() => {
    if (!isSelected) {
      setActiveField(null);
      setActiveFeatureIndex(null);
    }
  }, [isSelected]);

  const handlePointerDown = useWidgetPointerDown({
    onPointerDown,
    toolbarSelector: TOOLBAR_SELECTOR,
  });

  const handleFieldFocus = React.useCallback((field: ActiveField) => {
    setActiveField(field);
  }, []);

  const handleFeatureFocus = React.useCallback((index: number) => {
    setActiveField("feature");
    setActiveFeatureIndex(index);
  }, []);

  const handleFieldBlur = React.useCallback(
    (field: ActiveField) => {
      if (field === "planName") {
        debouncedUpdatePlanName.flush();
      } else if (field === "price") {
        debouncedUpdatePrice.flush();
      } else if (field === "period") {
        debouncedUpdatePeriod.flush();
      } else if (field === "badge") {
        debouncedUpdateBadge.flush();
      } else if (field === "buttonText") {
        debouncedUpdateButtonText.flush();
      } else if (field === "feature") {
        debouncedUpdateFeatures.flush();
      }
    },
    [
      debouncedUpdatePlanName,
      debouncedUpdatePrice,
      debouncedUpdatePeriod,
      debouncedUpdateBadge,
      debouncedUpdateButtonText,
      debouncedUpdateFeatures,
    ]
  );

  const handleFeatureChange = React.useCallback(
    (index: number, value: string) => {
      if (!isSelected) return;
      const newFeatures = [...localFeatures];
      newFeatures[index] = value;
      setLocalFeatures(newFeatures);
      debouncedUpdateFeatures(newFeatures);
    },
    [isSelected, localFeatures, debouncedUpdateFeatures]
  );

  const handleAddFeature = React.useCallback(() => {
    if (!isSelected) return;
    const newFeatures = [...localFeatures, ""];
    setLocalFeatures(newFeatures);
    debouncedUpdateFeatures(newFeatures);
    setActiveFeatureIndex(newFeatures.length - 1);
  }, [isSelected, localFeatures, debouncedUpdateFeatures]);

  const handleRemoveFeature = React.useCallback(
    (index: number) => {
      if (!isSelected || localFeatures.length <= 1) return;
      const newFeatures = localFeatures.filter((_, i) => i !== index);
      setLocalFeatures(newFeatures);
      debouncedUpdateFeatures(newFeatures);
    },
    [isSelected, localFeatures, debouncedUpdateFeatures]
  );

  const backgroundColor = widget.backgroundColor ?? "#ffffff";
  const backgroundType = widget.backgroundType ?? "solid";
  const textAlign = widget.textAlign ?? "center";

  const planNameColor = widget.planNameColor ?? "#0f172a";
  const priceColor = widget.priceColor ?? "#0f172a";
  const periodColor = widget.periodColor ?? "#64748b";
  const badgeColor = widget.badgeColor ?? "#2563eb";
  const badgeTextColor = widget.badgeTextColor ?? "#ffffff";
  const featureColor = widget.featureColor ?? "#0f172a";
  const buttonColor = widget.buttonColor ?? "#2563eb";
  const buttonTextColor = widget.buttonTextColor ?? "#ffffff";

  const planNameFontFamily = widget.planNameFontFamily ?? "var(--font-poppins)";
  const priceFontFamily = widget.priceFontFamily ?? "var(--font-poppins)";
  const periodFontFamily = widget.periodFontFamily ?? "var(--font-poppins)";
  const badgeFontFamily = widget.badgeFontFamily ?? "var(--font-poppins)";
  const featureFontFamily = widget.featureFontFamily ?? "var(--font-poppins)";
  const buttonFontFamily = widget.buttonFontFamily ?? "var(--font-poppins)";

  const planNameFontSize = widget.planNameFontSize ?? 28;
  const priceFontSize = widget.priceFontSize ?? 48;
  const periodFontSize = widget.periodFontSize ?? 18;
  const badgeFontSize = widget.badgeFontSize ?? 12;
  const featureFontSize = widget.featureFontSize ?? 16;
  const buttonFontSize = widget.buttonFontSize ?? 16;

  const toolbar = isSelected ? (
    <PricingCardEditingToolbar
      widget={widget}
      isEditing={isEditing}
      activeField={activeField}
      activeFeatureIndex={activeFeatureIndex}
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
        <div
          className={cn(
            "flex h-full w-full flex-col px-6 py-5",
            textAlign === "center" && "items-center text-center",
            textAlign === "left" && "items-start text-left",
            textAlign === "right" && "items-end text-right"
          )}
        >
          {/* Badge */}
          {localBadge && (
            <div
              className="inline-flex items-center justify-center rounded-full px-3 py-1.5 mb-2"
              style={{
                backgroundColor: badgeColor,
                color: badgeTextColor,
                fontFamily: badgeFontFamily,
                fontSize: badgeFontSize,
                fontWeight: 600,
              }}
            >
              <ProseMirrorEditor
                value={localBadge}
                onChange={(value) => {
                  if (!isSelected) return;
                  setLocalBadge(value);
                  debouncedUpdateBadge(value);
                }}
                onFocus={() => {
                  if (!isSelected) return;
                  handleFieldFocus("badge");
                }}
                onBlur={() => handleFieldBlur("badge")}
                placeholder="Popular"
                readOnly={!isSelected}
                className={cn(
                  "uppercase tracking-wide",
                  isSelected ? "cursor-text" : "cursor-default"
                )}
                style={{
                  textAlign: "center",
                }}
              />
            </div>
          )}

          {/* Plan Name */}
          <div className="w-full mb-3">
            <ProseMirrorEditor
              value={localPlanName}
              onChange={(value) => {
                if (!isSelected) return;
                setLocalPlanName(value);
                debouncedUpdatePlanName(value);
              }}
              onFocus={() => {
                if (!isSelected) return;
                handleFieldFocus("planName");
              }}
              onBlur={() => handleFieldBlur("planName")}
              placeholder="Plan Name"
              readOnly={!isSelected}
              className={cn(
                "w-full font-semibold",
                isSelected ? "cursor-text" : "cursor-default"
              )}
              style={{
                color: planNameColor,
                fontFamily: planNameFontFamily,
                fontSize: planNameFontSize,
                lineHeight: 1.2,
                textAlign,
                wordWrap: "break-word",
                overflowWrap: "break-word",
              }}
            />
          </div>

          {/* Price and Period */}
          <div
            className="flex items-baseline gap-2 mb-6"
            style={{
              justifyContent:
                textAlign === "center"
                  ? "center"
                  : textAlign === "right"
                  ? "flex-end"
                  : "flex-start",
            }}
          >
            <ProseMirrorEditor
              value={localPrice}
              onChange={(value) => {
                if (!isSelected) return;
                setLocalPrice(value);
                debouncedUpdatePrice(value);
              }}
              onFocus={() => {
                if (!isSelected) return;
                handleFieldFocus("price");
              }}
              onBlur={() => handleFieldBlur("price")}
              placeholder="$0"
              readOnly={!isSelected}
              className={cn(
                "font-bold",
                isSelected ? "cursor-text" : "cursor-default"
              )}
              style={{
                color: priceColor,
                fontFamily: priceFontFamily,
                fontSize: priceFontSize,
                lineHeight: 1,
                textAlign,
              }}
            />
            <ProseMirrorEditor
              value={localPeriod}
              onChange={(value) => {
                if (!isSelected) return;
                setLocalPeriod(value);
                debouncedUpdatePeriod(value);
              }}
              onFocus={() => {
                if (!isSelected) return;
                handleFieldFocus("period");
              }}
              onBlur={() => handleFieldBlur("period")}
              placeholder="/mo"
              readOnly={!isSelected}
              className={cn(
                "font-medium",
                isSelected ? "cursor-text" : "cursor-default"
              )}
              style={{
                color: periodColor,
                fontFamily: periodFontFamily,
                fontSize: periodFontSize,
                lineHeight: 1,
                textAlign,
              }}
            />
          </div>

          {/* Features List */}
          <div
            className={cn(
              "flex flex-col gap-3 w-full mb-6 group/features",
              textAlign === "center" && "items-center",
              textAlign === "right" && "items-end",
              textAlign === "left" && "items-start"
            )}
          >
            {localFeatures.map((feature, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-3 group/feature w-full",
                  textAlign === "center" && "justify-center",
                  textAlign === "right" && "justify-end",
                  textAlign === "left" && "justify-start"
                )}
              >
                {textAlign !== "right" && (
                  <Check
                    className="shrink-0 mt-0.5"
                    style={{
                      color: featureColor,
                      width: `${Math.max(18, featureFontSize)}px`,
                      height: `${Math.max(18, featureFontSize)}px`,
                      strokeWidth: 2.5,
                    }}
                  />
                )}
                <div
                  className={cn(
                    "flex items-start min-w-0 relative",
                    textAlign === "center" && "flex-1 justify-center",
                    textAlign === "right" && "flex-1 justify-end",
                    textAlign === "left" && "flex-1"
                  )}
                >
                  <ProseMirrorEditor
                    value={feature}
                    onChange={(value) => handleFeatureChange(index, value)}
                    onFocus={() => {
                      if (!isSelected) return;
                      handleFeatureFocus(index);
                    }}
                    onBlur={() => {
                      if (activeFeatureIndex === index) {
                        debouncedUpdateFeatures.flush();
                        setActiveFeatureIndex(null);
                      }
                    }}
                    placeholder="Feature item"
                    readOnly={!isSelected}
                    className={cn(
                      "w-full",
                      isSelected ? "cursor-text" : "cursor-default",
                      textAlign === "center" && "text-center",
                      textAlign === "right" && "text-right",
                      textAlign === "left" && "text-left"
                    )}
                    style={{
                      color: featureColor,
                      fontFamily: featureFontFamily,
                      fontSize: featureFontSize,
                      lineHeight: 1.6,
                      textAlign: textAlign,
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                      minHeight: "1.5rem",
                    }}
                    onKeyDown={(event) => {
                      // Enter to add new feature item (like list card)
                      if (event.key === "Enter" && !event.shiftKey && isSelected) {
                        event.preventDefault();
                        handleAddFeature();
                        return;
                      }
                      
                      if (
                        event.key === "Backspace" &&
                        feature === "" &&
                        localFeatures.length > 1 &&
                        isSelected
                      ) {
                        event.preventDefault();
                        handleRemoveFeature(index);
                      }
                    }}
                  />
                  {/* Remove button */}
                  {isSelected && localFeatures.length > 1 && (
                    <button
                      data-remove-feature
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFeature(index);
                      }}
                      className={cn(
                        "opacity-0 group-hover/feature:opacity-100 transition-all duration-200 p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive shrink-0 absolute top-0 cursor-pointer z-20",
                        textAlign === "right" ? "left-0" : "right-0"
                      )}
                      title="Remove feature"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {textAlign === "right" && (
                  <Check
                    className="shrink-0 mt-0.5"
                    style={{
                      color: featureColor,
                      width: `${Math.max(18, featureFontSize)}px`,
                      height: `${Math.max(18, featureFontSize)}px`,
                      strokeWidth: 2.5,
                    }}
                  />
                )}
              </div>
            ))}

            {/* Add feature button */}
            {isSelected && (
              <div
                className={cn(
                  "w-full flex",
                  textAlign === "center" && "justify-center",
                  textAlign === "right" && "justify-end",
                  textAlign === "left" && "justify-start"
                )}
              >
                <button
                  data-add-feature
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddFeature();
                  }}
                  className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-all duration-200 mt-1 opacity-0 group-hover/features:opacity-100 hover:gap-3 cursor-pointer relative z-20"
                  title="Add feature"
                >
                  <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-dashed border-current/30 hover:border-current/60 transition-colors">
                    <Plus className="h-3 w-3" />
                  </div>
                  <span className="font-medium">Add feature</span>
                </button>
              </div>
            )}
          </div>

          {/* Button */}
          <div
            className="w-full mt-auto"
            style={{
              display: "flex",
              justifyContent:
                textAlign === "center"
                  ? "center"
                  : textAlign === "right"
                  ? "flex-end"
                  : "flex-start",
            }}
          >
            <div
              className="inline-flex items-center justify-center rounded-lg px-6 py-3 font-semibold transition-all hover:opacity-90 cursor-pointer"
              style={{
                backgroundColor: buttonColor,
                color: buttonTextColor,
                fontFamily: buttonFontFamily,
                fontSize: buttonFontSize,
                minWidth: "140px",
              }}
            >
              <ProseMirrorEditor
                value={localButtonText}
                onChange={(value) => {
                  if (!isSelected) return;
                  setLocalButtonText(value);
                  debouncedUpdateButtonText(value);
                }}
                onFocus={() => {
                  if (!isSelected) return;
                  handleFieldFocus("buttonText");
                }}
                onBlur={() => handleFieldBlur("buttonText")}
                placeholder="Get Started"
                readOnly={!isSelected}
                className={cn(
                  "text-center w-full",
                  isSelected ? "cursor-text" : "cursor-default"
                )}
                style={{
                  textAlign: "center",
                }}
              />
            </div>
          </div>
        </div>
      </WidgetBackground>
    </WidgetContainer>
  );
};

export const PricingCardWidgetNode = React.memo(PricingCardWidgetNodeBase);

type PricingCardEditingToolbarProps = {
  widget: PricingCardWidget;
  isEditing: boolean;
  activeField: ActiveField;
  activeFeatureIndex: number | null;
  widgetRef: React.RefObject<HTMLElement | null>;
  viewport: Viewport;
  containerRef: React.RefObject<HTMLElement | null>;
};

const PricingCardEditingToolbar: React.FC<PricingCardEditingToolbarProps> = ({
  widget,
  isEditing,
  activeField,
  activeFeatureIndex,
  widgetRef,
  viewport,
  containerRef,
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

  const handleSetBackgroundType = (type: PricingCardWidget["backgroundType"]) => {
    if (type === (widget.backgroundType ?? "solid")) return;
    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { backgroundType: type },
      })
    );
  };

  const handleSetColor = (color: string) => {
    if (!activeField) return;

    const colorKey =
      activeField === "planName"
        ? "planNameColor"
        : activeField === "price"
        ? "priceColor"
        : activeField === "period"
        ? "periodColor"
        : activeField === "badge"
        ? "badgeColor"
        : activeField === "buttonText"
        ? "buttonTextColor"
        : activeField === "feature"
        ? "featureColor"
        : null;

    if (!colorKey) return;

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
      activeField === "planName"
        ? "planNameFontFamily"
        : activeField === "price"
        ? "priceFontFamily"
        : activeField === "period"
        ? "periodFontFamily"
        : activeField === "badge"
        ? "badgeFontFamily"
        : activeField === "buttonText"
        ? "buttonFontFamily"
        : activeField === "feature"
        ? "featureFontFamily"
        : null;

    if (!fontKey) return;

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
      activeField === "planName"
        ? "planNameFontSize"
        : activeField === "price"
        ? "priceFontSize"
        : activeField === "period"
        ? "periodFontSize"
        : activeField === "badge"
        ? "badgeFontSize"
        : activeField === "buttonText"
        ? "buttonFontSize"
        : activeField === "feature"
        ? "featureFontSize"
        : null;

    if (!sizeKey) return;

    dispatch(
      updateWidgetAction({
        slideId: activeSlideId,
        widgetId: widget.id,
        updates: { [sizeKey]: size },
      })
    );
  };

  const handleAlign = (align: "left" | "center" | "right") => {
    if (align !== (widget.textAlign ?? "center")) {
      dispatch(
        updateWidgetAction({
          slideId: activeSlideId,
          widgetId: widget.id,
          updates: { textAlign: align },
        })
      );
    }
  };

  const currentBackgroundColor = widget.backgroundColor ?? "#ffffff";
  const currentBackgroundType = widget.backgroundType ?? "solid";
  const currentAlign = widget.textAlign ?? "center";

  const currentColor =
    activeField === "planName"
      ? widget.planNameColor ?? "#0f172a"
      : activeField === "price"
      ? widget.priceColor ?? "#0f172a"
      : activeField === "period"
      ? widget.periodColor ?? "#64748b"
      : activeField === "badge"
      ? widget.badgeColor ?? "#2563eb"
      : activeField === "buttonText"
      ? widget.buttonTextColor ?? "#ffffff"
      : activeField === "feature"
      ? widget.featureColor ?? "#0f172a"
      : "#0f172a";

  const currentFontFamily =
    activeField === "planName"
      ? widget.planNameFontFamily ?? "var(--font-poppins)"
      : activeField === "price"
      ? widget.priceFontFamily ?? "var(--font-poppins)"
      : activeField === "period"
      ? widget.periodFontFamily ?? "var(--font-poppins)"
      : activeField === "badge"
      ? widget.badgeFontFamily ?? "var(--font-poppins)"
      : activeField === "buttonText"
      ? widget.buttonFontFamily ?? "var(--font-poppins)"
      : activeField === "feature"
      ? widget.featureFontFamily ?? "var(--font-poppins)"
      : "var(--font-poppins)";

  const currentFontSize =
    activeField === "planName"
      ? widget.planNameFontSize ?? 28
      : activeField === "price"
      ? widget.priceFontSize ?? 48
      : activeField === "period"
      ? widget.periodFontSize ?? 18
      : activeField === "badge"
      ? widget.badgeFontSize ?? 12
      : activeField === "buttonText"
      ? widget.buttonFontSize ?? 16
      : activeField === "feature"
      ? widget.featureFontSize ?? 16
      : 16;

  const controls: ToolbarControlConfig[] = [
    // Background color picker
    {
      type: "color-picker",
      config: {
        color: currentBackgroundColor,
        onChange: handleSetBackgroundColor,
        label: "Card Background",
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
        color: currentColor,
        onChange: handleSetColor,
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
      toolbarSelector="data-pricing-card-toolbar"
    />
  );
};

