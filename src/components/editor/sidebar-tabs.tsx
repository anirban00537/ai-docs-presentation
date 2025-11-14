"use client";

import React from "react";
import { MessageSquare, FileText, Clock, User, PenTool, X } from "lucide-react";
import { CustomSidebarMenuButton } from "@/components/editor/custom-sidebar";

export type TabId = "design" | "comment" | "content" | "history" | "people";

export const tabs: Array<{ id: TabId; icon: React.ReactNode; label: string }> = [
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

interface SidebarTabsProps {
  activeTab: TabId | null;
  onTabClick: (tabId: TabId) => void;
}

export function SidebarTabs({ activeTab, onTabClick }: SidebarTabsProps) {
  return (
    <div className="flex flex-col items-center justify-center bg-gradient-to-b from-background via-background to-muted/20 border-l border-border/30 shrink-0">
      {tabs.map((tab) => (
        <CustomSidebarMenuButton
          key={tab.id}
          onClick={() => onTabClick(tab.id)}
          isActive={activeTab === tab.id}
          tooltip={tab.label}
        >
          {tab.icon}
        </CustomSidebarMenuButton>
      ))}
    </div>
  );
}


