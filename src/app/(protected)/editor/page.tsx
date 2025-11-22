"use client";

import React from "react";
import Editor from "@/components/editor/editor";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { LeftSidebar } from "@/components/editor/left-sidebar";

export default function Page() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "14rem", // w-56 = 14rem
        } as React.CSSProperties
      }
    >
      <LeftSidebar />
      <SidebarInset className="flex flex-col overflow-hidden">
        <Editor />
      </SidebarInset>
    </SidebarProvider>
  );
}
