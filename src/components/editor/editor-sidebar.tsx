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
        <div className="h-2 w-2 rounded-full bg-primary"></div>
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

          <div className="flex-1 overflow-y-auto">
            {activeTab === "design" && (
              <div className="p-6 space-y-8">
                {/* Slide style */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-primary"></div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Template
                    </label>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between h-12 text-sm font-medium border-2 border-border/60 hover:border-primary/50 hover:bg-accent/30 transition-all rounded-xl bg-background/50"
                      >
                        <div className="flex items-center gap-3">
                          {slideStyles.find(
                            (s) => s.label === activeSlide.slideStyle
                          )?.icon || (
                            <div className="flex items-center gap-2">
                              <div className="h-5 w-5 rounded bg-black flex items-center justify-center">
                                <span className="text-[9px] text-white font-bold">
                                  E
                                </span>
                              </div>
                              <div className="h-2.5 w-2.5 rounded-full bg-primary"></div>
                            </div>
                          )}
                          <span className="truncate font-semibold">
                            {activeSlide.slideStyle ||
                              "Engineering Team Meeting"}
                          </span>
                        </div>
                        <svg
                          className="h-4 w-4 opacity-60"
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
                    <DropdownMenuContent className="w-80 rounded-xl">
                      {slideStyles.map((style) => (
                        <DropdownMenuItem
                          key={style.id}
                          onClick={() => handleSlideStyleChange(style.id)}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg"
                        >
                          {style.icon}
                          <span className="font-medium">{style.label}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent"></div>

                {/* Background color */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-primary"></div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Background
                    </label>
                  </div>
                  <div className="p-4 rounded-xl border-2 border-border/60 bg-gradient-to-br from-background to-muted/20">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <input
                          type="color"
                          value={activeSlide.backgroundColor || "#ffffff"}
                          onChange={(e) =>
                            handleBackgroundColorChange(e.target.value)
                          }
                          className="h-14 w-14 rounded-xl border-2 border-border/60 cursor-pointer hover:border-primary/50 hover:scale-105 transition-all appearance-none"
                          style={{
                            backgroundColor:
                              activeSlide.backgroundColor || "#ffffff",
                          }}
                        />
                        <div className="absolute inset-0 rounded-xl border-2 border-background pointer-events-none"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-muted-foreground mb-1.5">
                          Color Code
                        </div>
                        <div className="px-3 py-2 rounded-lg bg-background/80 border border-border/50 font-mono text-sm font-semibold text-foreground">
                          {activeSlide.backgroundColor || "#ffffff"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

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
                      <div className="relative w-full h-40 rounded-xl overflow-hidden border-2 border-border/60 group bg-muted/20">
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
                  <div className="flex items-center justify-between p-4 rounded-xl border-2 border-border/60 bg-gradient-to-br from-background to-muted/20">
                    <div>
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
    </CustomSidebar>
  );
}
