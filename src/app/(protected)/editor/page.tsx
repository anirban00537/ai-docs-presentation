"use client";

import { AppSidebar } from "@/components/editor-left-sidebar";
import Editor from "@/components/editor/editor";
import { EditorSidebar } from "@/components/editor/editor-sidebar";
import { EditorHeader } from "@/components/editor/editor-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useWidgetCreation } from "@/hooks/use-widget-creation";

export default function Page() {
  const { handleAddText, handleAddShape, handleAddFeatureCard } =
    useWidgetCreation();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="relative flex flex-col">
        <EditorHeader
          onAddText={handleAddText}
          onAddShape={handleAddShape}
          onAddFeatureCard={handleAddFeatureCard}
        />
        <div className="flex flex-1 flex-row overflow-hidden">
          <div className="flex-1 flex h-full items-center justify-center">
            <Editor />
          </div>
          <EditorSidebar />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
