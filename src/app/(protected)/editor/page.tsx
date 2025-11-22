"use client";

import React from "react";
import Editor from "@/components/editor/editor";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SlidesPreview } from "@/components/editor/slides-preview";

export default function Page() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "14rem", // w-56 = 14rem
        } as React.CSSProperties
      }
    >
      <SlidesPreview />
      <SidebarInset className="flex flex-col overflow-hidden">
        <Editor />
      </SidebarInset>
    </SidebarProvider>
  );
}
