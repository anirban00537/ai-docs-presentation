"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import {
  CustomSidebar,
  CustomSidebarContent,
  CustomSidebarHeader,
} from "@/components/editor/custom-sidebar";
import { SidebarTabs, TabId, tabs } from "@/components/editor/sidebar-tabs";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectActiveSlide, updateSlide } from "@/store/slices/slidesSlice";

const slideStyles = [
  {
    id: "engineering-team-meeting",
    label: "Engineering Team Meeting",
    icon: (
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 rounded bg-black flex items-center justify-center">
          <span className="text-[8px] text-white font-bold">E</span>
        </div>
        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
      </div>
    ),
  },
  {
    id: "presentation-default",
    label: "Presentation Default",
    icon: null,
  },
  {
    id: "minimal",
    label: "Minimal",
    icon: null,
  },
];

export function EditorSidebar() {
  const [activeTab, setActiveTab] = useState<TabId | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useAppDispatch();
  const activeSlide = useAppSelector(selectActiveSlide);

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

  const handleClose = () => {
    setActiveTab(null);
    setIsOpen(false);
  };

  const handleBackgroundColorChange = (color: string) => {
    dispatch(
      updateSlide({
        slideId: activeSlide.id,
        updates: { backgroundColor: color },
      })
    );
  };

  const handleSlideNumberToggle = (checked: boolean) => {
    dispatch(
      updateSlide({
        slideId: activeSlide.id,
        updates: { showSlideNumber: checked },
      })
    );
  };

  const handleSlideStyleChange = (styleId: string) => {
    const style = slideStyles.find((s) => s.id === styleId);
    if (style) {
      dispatch(
        updateSlide({
          slideId: activeSlide.id,
          updates: { slideStyle: style.label },
        })
      );
    }
  };

  return (
    <CustomSidebar isOpen={isOpen && !!activeTab}>
      {/* Tab Icons - Always visible */}
      <SidebarTabs
        activeTab={activeTab && isOpen ? activeTab : null}
        onTabClick={handleTabClick}
      />

      {/* Content Panel - Only visible when open */}
      {isOpen && activeTab && (
        <CustomSidebarContent className="flex-1">
          <CustomSidebarHeader className="justify-between">
            <h2 className="font-semibold text-base tracking-tight">
              Slide Settings
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md hover:bg-accent/60"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </CustomSidebarHeader>

          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {activeTab === "design" && (
              <>
                {/* Slide style */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-foreground">
                    Slide style
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between h-10 text-sm font-medium border-border/60 hover:border-primary/50 hover:bg-accent/50 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          {slideStyles.find(
                            (s) => s.label === activeSlide.slideStyle
                          )?.icon || (
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-4 rounded bg-black flex items-center justify-center">
                                <span className="text-[8px] text-white font-bold">
                                  E
                                </span>
                              </div>
                              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                            </div>
                          )}
                          <span className="truncate">
                            {activeSlide.slideStyle ||
                              "Engineering Team Meeting"}
                          </span>
                        </div>
                        <svg
                          className="h-4 w-4 opacity-50"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80">
                      {slideStyles.map((style) => (
                        <DropdownMenuItem
                          key={style.id}
                          onClick={() => handleSlideStyleChange(style.id)}
                          className="flex items-center gap-2"
                        >
                          {style.icon}
                          <span>{style.label}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Background color */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-foreground">
                    Background color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={activeSlide.backgroundColor || "#ffffff"}
                      onChange={(e) =>
                        handleBackgroundColorChange(e.target.value)
                      }
                      className="h-10 w-10 rounded-lg border-2 border-border/60 cursor-pointer hover:border-primary/50 hover:scale-105 transition-all"
                      style={{
                        backgroundColor:
                          activeSlide.backgroundColor || "#ffffff",
                      }}
                    />
                    <span className="text-xs text-muted-foreground font-mono">
                      {activeSlide.backgroundColor || "#ffffff"}
                    </span>
                  </div>
                </div>

                {/* Background image */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-foreground">
                    Background image
                  </label>
                  {activeSlide.backgroundImage ? (
                    <div className="space-y-3">
                      <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border/60 group">
                        <img
                          src={activeSlide.backgroundImage}
                          alt="Background"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </div>
                      <Button
                        variant="outline"
                        className="w-full h-10 border-destructive/50 text-destructive hover:bg-destructive/10 hover:border-destructive transition-all"
                        onClick={() => {
                          dispatch(
                            updateSlide({
                              slideId: activeSlide.id,
                              updates: { backgroundImage: undefined },
                            })
                          );
                        }}
                      >
                        Remove background image
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full h-10 border-dashed hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all"
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
                      Edit background image
                    </Button>
                  )}
                </div>

                {/* Slide number */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                    <label className="text-sm font-semibold text-foreground">
                      Slide number
                    </label>
                    <Switch
                      checked={activeSlide.showSlideNumber || false}
                      onCheckedChange={handleSlideNumberToggle}
                    />
                  </div>
                </div>
              </>
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
    </CustomSidebar>
  );
}
