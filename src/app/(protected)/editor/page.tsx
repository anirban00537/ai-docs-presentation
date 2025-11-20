"use client";

import Editor from "@/components/editor/editor";
import { EditorHeader } from "@/components/editor/editor-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useWidgetCreation } from "@/hooks/use-widget-creation";

export default function Page() {
  const { handleAddText, handleAddShape, handleAddFeatureCard } =
    useWidgetCreation();

  return (
    <SidebarProvider>
      <SidebarInset className="relative flex flex-col">
        <EditorHeader
          onAddText={handleAddText}
          onAddShape={handleAddShape}
          onAddFeatureCard={handleAddFeatureCard}
        />
        <div className="flex flex-1 overflow-hidden">
          <Editor />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
