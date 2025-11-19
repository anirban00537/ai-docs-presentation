"use client";

import React from "react";
import { MessageSquare, FileText, Clock, User, PenTool } from "lucide-react";
import { CustomSidebarMenuButton } from "@/components/editor/custom-sidebar";
import { cn } from "@/lib/utils";

export type TabId = "design" | "comment" | "content" | "history" | "people";

export const tabs: Array<{ id: TabId; icon: React.ReactNode; label: string }> = [
  {
    id: "design",
    icon: <PenTool className="h-5 w-5" />,
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

interface SidebarTabsProps {
  activeTab: TabId | null;
  onTabClick: (tabId: TabId) => void;
}

export function SidebarTabs({ activeTab, onTabClick }: SidebarTabsProps) {
  return (
    <div className="flex flex-col items-center shrink-0 py-4 px-2 gap-4 border-l border-border/40 bg-background/40 backdrop-blur-sm">
      {tabs.map((tab) => (
        <CustomSidebarMenuButton
          key={tab.id}
          onClick={() => onTabClick(tab.id)}
          isActive={activeTab === tab.id}
          tooltip={tab.label}
          className={cn(
            "w-10 h-10 rounded-xl transition-all duration-300",
            activeTab === tab.id
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          )}
        >
          {tab.icon}
        </CustomSidebarMenuButton>
      ))}
    </div>
  );
}


