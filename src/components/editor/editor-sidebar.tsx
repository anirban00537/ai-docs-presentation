"use client";

import React, { useState } from "react";
import { X, MessageSquare, FileText, Clock, User, PenTool } from "lucide-react";
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
  CustomSidebarMenuButton,
} from "@/components/editor/custom-sidebar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectActiveSlide, updateSlide } from "@/store/slices/slidesSlice";

type TabId = "design" | "comment" | "content" | "history" | "people";

const tabs: Array<{ id: TabId; icon: React.ReactNode; label: string }> = [
  {
    id: "design",
    icon: (
      <div className="relative">
        <PenTool className="h-5 w-5" />
        <X className="h-3 w-3 absolute -top-0.5 -right-0.5" strokeWidth={3} />
      </div>
    ),
    label: "Design",
  },
  {
    id: "comment",
    icon: <MessageSquare className="h-5 w-5" />,
    label: "Comment",
  },
  { id: "content", icon: <FileText className="h-5 w-5" />, label: "Content" },
  { id: "history", icon: <Clock className="h-5 w-5" />, label: "History" },
  { id: "people", icon: <User className="h-5 w-5" />, label: "People" },
];

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
      <div className="flex flex-col items-center border-r w-12 bg-background">
        {tabs.map((tab) => (
          <CustomSidebarMenuButton
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            isActive={activeTab === tab.id && isOpen}
            tooltip={tab.label}
          >
            {tab.icon}
          </CustomSidebarMenuButton>
        ))}
      </div>

      {/* Content Panel - Only visible when open */}
      {isOpen && activeTab && (
        <CustomSidebarContent className="flex-1">
          <CustomSidebarHeader className="justify-between">
            <h2 className="font-semibold text-sm">Slide</h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </CustomSidebarHeader>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {activeTab === "design" && (
              <>
                {/* Slide style */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Slide style
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between h-9 text-sm font-normal"
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
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Background color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={activeSlide.backgroundColor || "#ffffff"}
                      onChange={(e) =>
                        handleBackgroundColorChange(e.target.value)
                      }
                      className="h-8 w-8 rounded-full border-2 border-border cursor-pointer"
                      style={{
                        backgroundColor:
                          activeSlide.backgroundColor || "#ffffff",
                      }}
                    />
                  </div>
                </div>

                {/* Background image */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Background image
                  </label>
                  {activeSlide.backgroundImage ? (
                    <div className="space-y-2">
                      <div className="relative w-full h-32 rounded-md overflow-hidden border border-border">
                        <img
                          src={activeSlide.backgroundImage}
                          alt="Background"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
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
                      className="w-full"
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
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">
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
              <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
                {tabs.find((t) => t.id === activeTab)?.label} tab coming soon
              </div>
            )}
          </div>
        </CustomSidebarContent>
      )}
    </CustomSidebar>
  );
}
