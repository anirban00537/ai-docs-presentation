"use client";

import React, { useState, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowUpRight,
  ArrowRight,
  ArrowDownRight,
  ArrowDown,
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpLeft,
} from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CustomSidebar,
  CustomSidebarContent,
} from "@/components/editor/custom-sidebar";
import { SidebarTabs, TabId, tabs } from "@/components/editor/sidebar-tabs";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectActiveSlide, updateSlide } from "@/store/slices/slidesSlice";
import { cn } from "@/lib/utils";

// Portal-based Color Picker Component
function ColorPickerPortal({
  isOpen,
  color,
  onChange,
  pickerId,
  refsMap,
}: {
  isOpen: boolean;
  color: string;
  onChange: (color: string) => void;
  pickerId: string;
  refsMap: React.MutableRefObject<Map<string, HTMLButtonElement>>;
}) {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (isOpen) {
      const buttonElement = refsMap.current.get(pickerId);
      if (buttonElement) {
        const rect = buttonElement.getBoundingClientRect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
        setPosition({
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX,
        });
      }
    }
    // Position calculation is intentional synchronous update for portal rendering
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, pickerId]);

  if (!isOpen || typeof window === "undefined") return null;

  return createPortal(
    <div
      data-color-picker
      className="fixed z-[9999]"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <HexColorPicker color={color} onChange={onChange} />
    </div>,
    document.body
  );
}

export function EditorSidebar() {
  const [activeTab, setActiveTab] = useState<TabId | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [backgroundType, setBackgroundType] = useState<"solid" | "gradient">(
    "solid"
  );
  const [isBackgroundOpen, setIsBackgroundOpen] = useState(true);
  const [openColorPicker, setOpenColorPicker] = useState<string | null>(null);
  const colorPickerRefs = React.useRef<Map<string, HTMLButtonElement>>(
    new Map()
  );
  const dispatch = useAppDispatch();
  const activeSlide = useAppSelector(selectActiveSlide);

  // Initialize background type from slide
  React.useEffect(() => {
    if (activeSlide?.backgroundType) {
      setBackgroundType(activeSlide.backgroundType);
    }
  }, [activeSlide?.backgroundType]);

  // Close color picker when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (
        openColorPicker &&
        !target.closest("[data-color-picker]") &&
        !target.closest("[data-color-picker-button]")
      ) {
        setOpenColorPicker(null);
      }
    };
    if (openColorPicker) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [openColorPicker]);

  if (!activeSlide) return null;

  const handleTabClick = (tabId: TabId) => {
    if (activeTab === tabId) {
      setActiveTab(null);
      setIsOpen(false);
    } else {
      setActiveTab(tabId);
      setIsOpen(true);
    }
  };

  const handleBackgroundColorChange = (color: string) => {
    dispatch(
      updateSlide({
        slideId: activeSlide.id,
        updates: {
          backgroundColor: color,
          backgroundType: "solid",
        },
      })
    );
  };

  const handleBackgroundTypeChange = (type: "solid" | "gradient") => {
    setBackgroundType(type);
    dispatch(
      updateSlide({
        slideId: activeSlide.id,
        updates: { backgroundType: type },
      })
    );
  };

  const handleGradientColorChange = (index: number, color: string) => {
    const currentGradient = activeSlide.backgroundGradient || [
      "#ffffff",
      "#f0f0f0",
    ];
    const newGradient = [...currentGradient];
    newGradient[index] = color;
    dispatch(
      updateSlide({
        slideId: activeSlide.id,
        updates: {
          backgroundGradient: newGradient,
          backgroundType: "gradient",
        },
      })
    );
  };

  const handleAddGradientColor = () => {
    const currentGradient = activeSlide.backgroundGradient || [
      "#ffffff",
      "#f0f0f0",
    ];
    const newGradient = [...currentGradient, "#ffffff"];
    dispatch(
      updateSlide({
        slideId: activeSlide.id,
        updates: {
          backgroundGradient: newGradient,
          backgroundType: "gradient",
        },
      })
    );
  };

  const handleRemoveGradientColor = (index: number) => {
    const currentGradient = activeSlide.backgroundGradient || [
      "#ffffff",
      "#f0f0f0",
    ];
    if (currentGradient.length <= 2) return; // Keep at least 2 colors
    const newGradient = currentGradient.filter((_, i) => i !== index);
    dispatch(
      updateSlide({
        slideId: activeSlide.id,
        updates: {
          backgroundGradient: newGradient,
          backgroundType: "gradient",
        },
      })
    );
  };

  const handleGradientDirectionChange = (direction: string) => {
    dispatch(
      updateSlide({
        slideId: activeSlide.id,
        updates: {
          backgroundGradientDirection: direction,
          backgroundType: "gradient",
        },
      })
    );
  };

  const gradientDirections = [
    { name: "to top", icon: <ArrowUp size={18} className="text-white" /> },
    {
      name: "to top right",
      icon: <ArrowUpRight size={18} className="text-white" />,
    },
    { name: "to right", icon: <ArrowRight size={18} className="text-white" /> },
    {
      name: "to bottom right",
      icon: <ArrowDownRight size={18} className="text-white" />,
    },
    { name: "to bottom", icon: <ArrowDown size={18} className="text-white" /> },
    {
      name: "to bottom left",
      icon: <ArrowDownLeft size={18} className="text-white" />,
    },
    { name: "to left", icon: <ArrowLeft size={18} className="text-white" /> },
    {
      name: "to top left",
      icon: <ArrowUpLeft size={18} className="text-white" />,
    },
  ];

  const handleSlideNumberToggle = (checked: boolean) => {
    dispatch(
      updateSlide({
        slideId: activeSlide.id,
        updates: { showSlideNumber: checked },
      })
    );
  };

  return (
    <CustomSidebar isOpen={isOpen && !!activeTab}>
      {/* Content Panel - Only visible when open */}
      {isOpen && activeTab && (
        <CustomSidebarContent className="flex-1">
          <div className="flex-1 overflow-y-auto">
            {activeTab === "design" && (
              <div className="p-4 space-y-6 max-w-full overflow-visible">
                {/* Background - Collapsible */}
                <Collapsible
                  open={isBackgroundOpen}
                  onOpenChange={setIsBackgroundOpen}
                >
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-primary"></div>
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Background
                        </label>
                      </div>
                      {isBackgroundOpen ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4 space-y-5">
                    {/* Tabs for Solid/Gradient */}
                    <div className="flex gap-6 border-b border-border/50">
                      <button
                        type="button"
                        onClick={() => handleBackgroundTypeChange("solid")}
                        className={cn(
                          "relative pb-2 px-1 text-sm font-medium transition-colors",
                          backgroundType === "solid"
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        Solid
                        {backgroundType === "solid" && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBackgroundTypeChange("gradient")}
                        className={cn(
                          "relative pb-2 px-1 text-sm font-medium transition-colors",
                          backgroundType === "gradient"
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        Gradient
                        {backgroundType === "gradient" && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                        )}
                      </button>
                    </div>

                    {/* Solid Color Tab */}
                    {backgroundType === "solid" && (
                      <div className="space-y-5">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-3 block">
                            Color
                          </label>
                          <div className="grid grid-cols-6 gap-2 overflow-visible">
                            <div className="relative overflow-visible">
                              {(() => {
                                const pickerId = "color-picker";
                                return (
                                  <>
                                    <button
                                      ref={(el) => {
                                        if (el) {
                                          colorPickerRefs.current.set(
                                            pickerId,
                                            el
                                          );
                                        } else {
                                          colorPickerRefs.current.delete(
                                            pickerId
                                          );
                                        }
                                      }}
                                      className="relative w-10 h-10 rounded-full cursor-pointer border-2 border-border/60 hover:border-primary/50 transition-all hover:scale-110"
                                      onClick={() =>
                                        setOpenColorPicker(
                                          openColorPicker === pickerId
                                            ? null
                                            : pickerId
                                        )
                                      }
                                      data-color-picker-button
                                    >
                                      <div
                                        className="w-full h-full rounded-full"
                                        style={{
                                          backgroundColor:
                                            activeSlide.backgroundColor ||
                                            "#ffffff",
                                        }}
                                      />
                                    </button>
                                    <ColorPickerPortal
                                      isOpen={openColorPicker === pickerId}
                                      color={
                                        activeSlide.backgroundColor || "#ffffff"
                                      }
                                      onChange={(newColor) => {
                                        handleBackgroundColorChange(newColor);
                                        setOpenColorPicker(null);
                                      }}
                                      pickerId={pickerId}
                                      refsMap={colorPickerRefs}
                                    />
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Gradient Color Tab */}
                    {backgroundType === "gradient" && (
                      <div className="space-y-5">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-3 block">
                            Gradient Colors
                          </label>
                          <div className="grid grid-cols-6 gap-2 overflow-visible">
                            <button
                              className="relative w-10 h-10 rounded-full cursor-pointer border-2 border-border/60 bg-muted/30 flex items-center justify-center hover:border-primary/50 hover:bg-muted/50 transition-all"
                              onClick={handleAddGradientColor}
                            >
                              <Plus
                                size={18}
                                className="text-muted-foreground"
                              />
                            </button>
                            {(
                              activeSlide.backgroundGradient || [
                                "#ffffff",
                                "#f0f0f0",
                              ]
                            ).map((color, index) => {
                              const pickerId = `gradient-color-${index}`;
                              return (
                                <div
                                  key={index}
                                  className="relative overflow-visible"
                                >
                                  <button
                                    ref={(el) => {
                                      if (el) {
                                        colorPickerRefs.current.set(
                                          pickerId,
                                          el
                                        );
                                      } else {
                                        colorPickerRefs.current.delete(
                                          pickerId
                                        );
                                      }
                                    }}
                                    className="relative w-10 h-10 rounded-full cursor-pointer border-2 border-border/60 hover:border-primary/50 transition-all hover:scale-110"
                                    onClick={() =>
                                      setOpenColorPicker(
                                        openColorPicker === pickerId
                                          ? null
                                          : pickerId
                                      )
                                    }
                                    data-color-picker-button
                                  >
                                    <div
                                      className="w-full h-full rounded-full"
                                      style={{ backgroundColor: color }}
                                    />
                                    {(activeSlide.backgroundGradient || [])
                                      .length > 2 && (
                                      <span
                                        className="absolute -top-1 -right-1 bg-destructive rounded-full p-0.5 cursor-pointer hover:bg-destructive/80 transition-colors z-10"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRemoveGradientColor(index);
                                        }}
                                      >
                                        <X className="text-white" size={12} />
                                      </span>
                                    )}
                                  </button>
                                  <ColorPickerPortal
                                    isOpen={openColorPicker === pickerId}
                                    color={color}
                                    onChange={(newColor) => {
                                      handleGradientColorChange(
                                        index,
                                        newColor
                                      );
                                      setOpenColorPicker(null);
                                    }}
                                    pickerId={pickerId}
                                    refsMap={colorPickerRefs}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground block">
                            Gradient Direction
                          </label>
                          <div className="flex gap-1.5">
                            {gradientDirections.map((direction, index) => {
                              const gradientColors =
                                activeSlide.backgroundGradient || [
                                  "#ffffff",
                                  "#f0f0f0",
                                ];
                              const isActive =
                                activeSlide.backgroundGradientDirection ===
                                direction.name;
                              return (
                                <button
                                  key={index}
                                  onClick={() =>
                                    handleGradientDirectionChange(
                                      direction.name
                                    )
                                  }
                                  className={cn(
                                    "rounded-lg overflow-hidden p-1.5 cursor-pointer flex items-center justify-center w-8 h-8 transition-all hover:scale-110",
                                    isActive &&
                                      "ring-2 ring-primary ring-offset-1 ring-offset-background shadow-sm"
                                  )}
                                  style={{
                                    background: `linear-gradient(${
                                      direction.name
                                    }, ${gradientColors.join(", ")})`,
                                  }}
                                  title={direction.name}
                                >
                                  <div className="scale-75">
                                    {direction.icon}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>

                {/* Background image */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-primary"></div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Image
                    </label>
                  </div>
                  {activeSlide.backgroundImage ? (
                    <div className="space-y-3">
                      <div className="relative w-full h-36 rounded-xl overflow-hidden border-2 border-border/60 group bg-muted/20">
                        <img
                          src={activeSlide.backgroundImage}
                          alt="Background"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full h-11 border-2 border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive transition-all rounded-xl font-semibold"
                        onClick={() => {
                          dispatch(
                            updateSlide({
                              slideId: activeSlide.id,
                              updates: { backgroundImage: undefined },
                            })
                          );
                        }}
                      >
                        Remove Image
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full h-12 border-2 border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/10 hover:text-primary transition-all rounded-xl font-semibold bg-gradient-to-br from-primary/5 to-transparent"
                      onClick={() => {
                        // TODO: Implement image upload
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/*";
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement)
                            .files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const result = event.target?.result as string;
                              dispatch(
                                updateSlide({
                                  slideId: activeSlide.id,
                                  updates: { backgroundImage: result },
                                })
                              );
                            };
                            reader.readAsDataURL(file);
                          }
                        };
                        input.click();
                      }}
                    >
                      <span className="text-base">+</span>
                      <span>Upload Background Image</span>
                    </Button>
                  )}
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent"></div>

                {/* Slide number */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-primary"></div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Options
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl border-2 border-border/60 bg-gradient-to-br from-background to-muted/20">
                    <div className="min-w-0 flex-1 pr-3">
                      <div className="text-sm font-semibold text-foreground mb-0.5">
                        Slide Number
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Show slide number on slide
                      </div>
                    </div>
                    <Switch
                      checked={activeSlide.showSlideNumber || false}
                      onCheckedChange={handleSlideNumberToggle}
                      className="shrink-0"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab !== "design" && (
              <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                <div className="rounded-full bg-muted/50 p-4 mb-4">
                  {tabs.find((t) => t.id === activeTab)?.icon && (
                    <div className="text-muted-foreground">
                      {tabs.find((t) => t.id === activeTab)?.icon}
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                  {tabs.find((t) => t.id === activeTab)?.label}
                </p>
                <p className="text-xs text-muted-foreground">Coming soon</p>
              </div>
            )}
          </div>
        </CustomSidebarContent>
      )}

      {/* Tab Icons - Always visible on the right */}
      <SidebarTabs
        activeTab={activeTab && isOpen ? activeTab : null}
        onTabClick={handleTabClick}
      />
    </CustomSidebar>
  );
}
