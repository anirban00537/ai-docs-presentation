"use client";

import React from "react";
import { MessageSquare, FileText, Clock, User, PenTool } from "lucide-react";
import { CustomSidebarMenuButton } from "@/components/editor/custom-sidebar";

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
    <div className="flex flex-col items-center justify-center shrink-0 p-3 relative z-0">
      <div className="flex flex-col items-center rounded-xl border border-border/40 bg-background/80 backdrop-blur-sm shadow-sm p-1 gap-0.5">
        {tabs.map((tab, index) => (
          <React.Fragment key={tab.id}>
            <CustomSidebarMenuButton
              onClick={() => onTabClick(tab.id)}
              isActive={activeTab === tab.id}
              tooltip={tab.label}
            >
              {tab.icon}
            </CustomSidebarMenuButton>
            {index < tabs.length - 1 && (
              <div className="w-7 h-px bg-border/20" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}


