"use client";

import { AppSidebar } from "@/components/app-sidebar";
import Editor from "@/components/editor/editor";
import { EditorSidebar } from "@/components/editor/editor-sidebar";
import { EditorHeader } from "@/components/editor/editor-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useElementCreation } from "@/hooks/use-element-creation";

export default function Page() {
  const { handleAddText, handleAddShape } = useElementCreation();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="relative flex flex-col">
        <EditorHeader onAddText={handleAddText} onAddShape={handleAddShape} />
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
