"use client";

import React from "react";
import Editor from "@/components/editor/editor";
import { LeftSidebar } from "@/components/editor/left-sidebar";
import {
  EditorSidebarProvider,
  useEditorSidebar,
} from "@/components/editor/editor-sidebar-shell";
import { cn } from "@/lib/utils";

export default function Page() {
  return (
    <EditorSidebarProvider>
      <EditorWorkspace />
    </EditorSidebarProvider>
  );
}

const EditorWorkspace = () => {
  const { collapsed } = useEditorSidebar();

  return (
    <div
      className={cn(
        "flex h-[calc(100vh-20px)] w-full transition-all duration-300",
        collapsed ? "gap-0" : "gap-3"
      )}
    >
      <LeftSidebar />
      <div className="flex flex-1 overflow-hidden rounded-2xl border border-border/60 bg-background">
        <Editor />
      </div>
    </div>
  );
};
