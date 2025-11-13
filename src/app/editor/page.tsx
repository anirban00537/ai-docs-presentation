"use client";

import { AppSidebar } from "@/components/app-sidebar";
import Editor from "@/components/editor/editor";
import { EditorSidebar } from "@/components/editor/editor-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="relative flex flex-row">
        <div className="flex-1 flex h-full items-center justify-center">
          <Editor />
        </div>
        <EditorSidebar />
      </SidebarInset>
    </SidebarProvider>
  );
}
